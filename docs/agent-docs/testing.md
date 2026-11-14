# Testing guide

CI (`.github/workflows/main.yml`) runs both suites on every push/PR to
`main` with Node 20 (`npm ci` + `npm test` in each project). Treat a failing
suite as a blocker.

> **Agents:** tests are your primary contribution to this codebase —
> application source code is off-limits for direct edits (see "Agent role and
> boundaries" in `AGENTS.md`). When behavior must change, write or adjust
> tests that encode the desired behavior (failing against current code is
> expected), then hand a specification or ready-to-apply diff to the human
> team. Test files must not be used as a loophole to smuggle in source-code
> changes (e.g. don't add production modules under `tests/`).

## API (`api/`)

```bash
cd api && npm test        # node --test
```

- Runner: **node:test** (built-in), plain `require` CommonJS.
- Suites: `auth.test.js`, `auth-delete.test.js`, `access.test.js`,
  `health.test.js`, `persistence.test.js`, `points.test.js`,
  `rate-limits.test.js`, `reports.test.js`, `schema.test.js`, and
  `security.regression.test.js`.
- **No backend mocking.** `tests/support/harness.js` spawns the real
  `src/server.js` on a free port against a temp SQLite DB, and exposes helpers
  (`openDatabase`, `startApiServer`, raw HTTP requests — including
  `localAddress` to exercise per-IP rate limits). `tests/support/auth.js`
  holds the OTC login helper (reads the code from the API log in guest mode).
- Pattern for new tests: `withServer(server => …)` in `health.test.js` /
  `points.test.js` is the canonical example. Most suites copy that helper
  locally.
- Remember the rate limits: tests that hit `/auth/login`, `/auth/token`,
  `/point/create`, or `/point/update` repeatedly per IP must use distinct
  `localAddress` values — the harness assigns one automatically unless a test
  passes an explicit address. See `rate-limits.test.js` for how.
- Current clean-checkout result (2026-11-14): **91 tests, 79 passing, 12
  skipped, 0 failing**. The skips are all in `security.regression.test.js`.
- `security.regression.test.js` is a **partially skip-gated red suite**: each
  skipped test fails against the current code on purpose and names the finding
  (`SEC-xxx`) it encodes. Activate a test by deleting its `skip` in the same PR
  that applies the fix. Do not "fix" a skipped test by weakening its
  assertion; the finding and the remediation spec live in
  [`security.md`](security.md). SEC-001, SEC-002 and SEC-003 are already active
  (13 active / 12 skipped).

## Webapp (`webapp/`)

```bash
cd webapp && npx vitest run   # single pass (npm test = watch mode locally)
```

- Runner: **vitest**. Suites: one `*-page.test.js` per implemented page
  (`index`, `map`, `menu`, `ong-menu`, `point-create`, `user-report`,
  `user-settings`), plus `backend.test.js`, `login.test.js`, `misc.test.js`,
  `points-logic.test.js`, `account.test.js`, `create-suggest.test.js`,
  `pages.test.js` (HTML structure and asset/link checks), and
  `manifest.test.js` (PWA manifest + page links).
- Current clean-checkout result (2026-11-14): **131 tests, 129 passing, 2
  todo, 0 failing**. The `pages.test.js` todos record known source defects
  (broken `/account-settings.html` links and the `point-create` biological
  flag); do not turn them into passing assertions against the buggy behavior.
- **No jsdom**: `tests/support/dom.js` hand-rolls elements/documents/windows
  (`makeElement`, `makeDocument`, `makeWindow`, `installCookieJar`). The
  document stub includes a body, `getElementsByTagName`, `prepend`, and event
  listeners. Pattern: `vi.mock` the `src/logic/*` modules,
  `vi.resetModules()`, import the page module, assert on the stub DOM. See
  `index-page.test.js`.
- The ONG panel imports `chart.js`; `ong-menu-page.test.js` mocks it and
  asserts on the `Chart` constructor arguments instead of drawing anything.
- Map tests stub Leaflet itself and include an `open-in-maps` element so the
  popup can register its access-logging click handler.

## Writing tests for new work

- API: new endpoint → extend the matching suite (`points.test.js` for point
  routes, `access.test.js` for access routes, etc.) or create
  `<feature>.test.js` following `health.test.js`.
- Webapp: new page → create `<page>-page.test.js` with mocked `logic/`
  modules; new logic module → add a focused `*-logic.test.js` (or add to
  `login.test.js`/`misc.test.js`).
- The team's test plan lives in `docs/plano-de-testes.md` (academic context:
  after the PO declares MVP, merges are blocked by failing tests). That file
  predates the current schema and test suites; `docs/wip/doc-drift.md` records
  the known divergence for the human team.
