# Architecture — ReciclaRP

## System overview

```
Browser (PWA, vanilla JS)  ──HTTP/JSON──▶  Express API (api/src/server.js)  ──▶  SQLite file (api/recicladb.sqlite)
        Leaflet/OpenStreetMap                    Resend (OTC emails)
```

- The webapp is a **multi-page** Vite app: one `.html` file per page in
  `webapp/`, each loading a matching `webapp/src/<page>.html.js` module via
  `<script type="module">`.
- Installability comes from `webapp/manifest.webmanifest` and the icons in
  `webapp/images/icons/`, linked from every page's `<head>`. There is no
  service worker: the app can be installed on mobile but has no offline mode,
  and every screen still needs the API.
- The API is the complete backend: authentication, authorization, business
  rules, validation, and data access all live in it. The webapp talks to it
  over plain `fetch` (JSON in, JSON out).
- There is no shared code between `api/` and `webapp/`; they are fully
  independent npm projects.

## Data model

Three tables (live schema is the SQL string inside `api/src/db/schema.js` —
`db/schema.sql` in the repo root is a stale reference copy):

- **`user`** — `id`, `uname`, `email` (unique), `banned`, `validated`, `ong` (bool flags). The ONG flag marks moderator accounts.
- **`point`** — `pid`, `pointdescription`, `lati`/`long` (REAL), `time_open`/`time_close` (TEXT, e.g. "7:00"), four `accepts_*` material flags (paper, metal, organic, biological), `approved` (0 = pending ONG moderation), `creator` → user.id.
- **`report`** — `rid`, `reportdescription`, three `category_*` flags (noexist, full, badtime), `uid` → user.id, `pid` → point.pid. Reports are citizen complaints about a point.

Domain flow: a citizen creates a point (`approved=0`) → an ONG approves it →
citizens file reports about points → the ONG fixes/edits the point.

## Authentication flow (OTC — one-time code)

1. `POST /auth/login` with an email → if the account exists and isn't banned,
   a 5-digit code is generated in an in-memory `Tickets` queue and emailed via
   Resend (or logged to stdout when `RECICLA_RESEND_SECRET` is unset —
   "guest mode").
2. `POST /auth/token` with email + code → returns a long-lived random token
   (stored in the in-memory `Tokens` map, keyed by email).
3. The webapp stores the token and email in cookies (`logintok`, `loginmail`)
   and validates them with `POST /auth/check`, which also returns the user's
   `id`, `name`, `banned`, and `ong` status.

Consequences to keep in mind:

- **Tokens and OTC codes are in-memory**: an API restart logs everyone out.
- Any authenticated request is `POST <route>` with `{ email, token, ... }`;
  the server re-derives the `Account` from the email and compares
  `account.token_read() == token`. There is no middleware; each route does
  this check itself.
- `RECICLA_ESCALATION_TOKEN` is generated/loaded at boot but currently unused
  by any route.

## Repository map (actual)

```
api/
  src/server.js          — the whole backend (~800 lines, single file)
  src/db/schema.js       — live schema SQL string + seed data (admin, 8 ecopontos)
  tests/                 — node:test suites; tests/support/harness.js spawns the server
  recicladb.sqlite       — local dev DB (gitignored)
webapp/
  *.html                 — pages: index, map, menu, ong-menu, point-create, user-report, user-settings, user-suggest
  manifest.webmanifest   — PWA install metadata (icons in images/icons/)
  src/<page>.html.js     — per-page entry modules
  src/logic/             — backend.js (fetch wrappers), login.js (cookie/session), misc.js
  src/miscellaneous_elements/ — shared UI bits (error popup)
  sitescripts/           — draft/sketch scripts, not wired into pages
  styles/                — general.css, mappage.css, topbar.css
  tests/                 — vitest suites with a hand-rolled DOM stub (tests/support/dom.js)
  fonts/, images/        — Atkinson Hyperlegible Next font, logo/icons (font licenses inside fonts/<name>/)
cli/main.js              — interactive script to call the API; ignorable
db/schema.sql            — stale reference schema (see warning above)
docs/                    — academic deliverables (see conventions-and-context.md)
```

## Known rough edges (treat carefully, don't "fix" blindly without asking)

- README's repo-structure section is outdated.
- The webapp's API base URL is hardcoded in `webapp/src/logic/backend.js`; the
  tracked `webapp/.env` uses an unused legacy name (`VUE_APP_RECICLA_API_URL`).
- API route handlers duplicate validation/boilerplate heavily; the `Account`
  class mixes concerns. Follow existing style over idealized refactors unless
  the task explicitly asks for it.
