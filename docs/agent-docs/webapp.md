# Webapp reference (`webapp/`)

Vite + vanilla JavaScript, no framework. Multi-page: every page is a root
`.html` file that loads a matching module from `src/` via
`<script type="module">`.

```bash
cd webapp && npm install && npm run dev   # vite, http://localhost:5173
```

`.env` is read by Vite, but note: the API base URL is currently **hardcoded**
(`const API_URL = "http://localhost:3000"`) in `src/logic/backend.js`, and the
tracked `.env` uses a legacy unused name. If you change API URL handling,
change `backend.js` — that's what actually runs.

## Pages and modules

| Page (root) | Module (src/) | Role |
| --- | --- | --- |
| `index.html` | `src/index.html.js` | Login (OTC email → code). Redirects to `/map.html` on success. |
| `map.html` | `src/map.html.js` | Main map page (Leaflet/OpenStreetMap), point listing. |
| `menu.html` | `src/menu.html.js` | Citizen menu. |
| `ong-menu.html` | `src/ong-menu.html.js` | ONG (moderator) menu. |
| `point-create.html` | `src/point-create.html.js` | Form to register a new collection point (goes in unapproved). |
| `user-report.html` | `src/user-report.html.js` | Report a problem with a point. |
| `user-settings.html` | `src/user-settings.html.js` | User settings / account deletion. |
| `user-suggest.html` | — | Suggestion page (see `sitescripts/create-suggest.js` sketch). |

Shared code:

- `src/logic/backend.js` — fetch wrappers for every API endpoint
  (`pullMapData`, `sendLoginCode`, `getLoginToken`, `checkLoginState`, …).
- `src/logic/login.js` — cookie session helpers (`logintok`, `loginmail`
  cookies; `loggedIn()`, `login()`, `requestLogin()`, `invalidateLogin()`).
  Login validity is 7 days (`LOGIN_VALID_DAYS`).
- `src/logic/misc.js`, `src/miscellaneous_elements/error_popup.js` — shared UI bits.
- `styles/` — `general.css`, `topbar.css`, `mappage.css`. Pages share styling
  conventions here; keep new pages consistent with them.
- `fonts/` — Atkinson Hyperlegible Next (accessibility-oriented; licenses in
  `fonts/<name>/OFL.txt` — keep licenses with fonts).
- `sitescripts/` — draft scripts not wired into any page; check before
  assuming a feature exists.

## Testing notes

- Tests are vitest suites in `tests/`, named `*-page.test.js` per page plus
  `backend.test.js`, `login.test.js` (covers `logic/`), and `misc.test.js`.
- There is **no jsdom** — `tests/support/dom.js` provides a hand-rolled stub
  (`makeElement`, `makeDocument`, `makeWindow`). Page modules are imported
  with `vi.resetModules()` and `logic/` modules are `vi.mock`ed; follow that
  pattern for new page tests.
- `npm test` runs vitest in **watch mode locally**; use `npx vitest run` for a
  single pass (CI sets the `CI` env var, which makes vitest run once).
