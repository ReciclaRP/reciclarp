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
- Suites: `auth.test.js`, `auth-delete.test.js`, `health.test.js`,
  `persistence.test.js`, `points.test.js`, `rate-limits.test.js`,
  `reports.test.js`, `schema.test.js`.
- **No backend mocking.** `tests/support/harness.js` compacts/spawns the real
  `src/server.js` on a free port against a temp SQLite DB, and exposes helpers
  (`openDatabase`, `startApiServer`, raw HTTP requests — including
  `localAddress` to exercise per-IP rate limits). `tests/support/auth.js`
  holds auth helpers.
- Pattern for new tests: `withServer(server => …)` in `health.test.js` /
  `points.test.js` is the canonical example.
- Remember the rate limits: tests that hit `/auth/login` or `/point/*` more
  than once per 2 min per IP must use distinct `localAddress` values — see
  `rate-limits.test.js` for how.

## Webapp (`webapp/`)

```bash
cd webapp && npx vitest run   # single pass (npm test = watch mode locally)
```

- Runner: **vitest**. Suites: one `*-page.test.js` per page, plus
  `backend.test.js`, `login.test.js` (for `src/logic/`), `misc.test.js`,
  `pages.test.js`, `manifest.test.js` (PWA manifest + page links).
- **No jsdom**: `tests/support/dom.js` hand-rolls elements/documents/windows.
  Pattern: `vi.mock` the `src/logic/*` modules, `vi.resetModules()`, import
  the page module, assert on the stub DOM. See `index-page.test.js`.

## Writing tests for new work

- API: new endpoint → extend the matching suite (`points.test.js` for point
  routes, etc.) or create `<feature>.test.js` following `health.test.js`.
- Webapp: new page → create `<page>-page.test.js` with mocked `logic/` modules.
- The team's test plan lives in `docs/plano-de-testes.md` (academic context:
  after the PO declares MVP, merges are blocked by failing tests).
