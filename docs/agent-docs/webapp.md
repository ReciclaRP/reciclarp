# Webapp reference (`webapp/`)

Vite + vanilla JavaScript, no framework. Multi-page: every page is a root
`.html` file that loads a matching module from `src/` via
`<script type="module">`.

```bash
cd webapp && npm install && npm run dev   # vite, http://localhost:5173
```

The API base URL is currently **hardcoded** (`const API_URL =
"http://localhost:3000"`) in `src/logic/backend.js`, and the tracked `.env`
uses a legacy unused name. If you change API URL handling, change `backend.js`
— that's what actually runs.

## Pages and modules

| Page (root) | Module (src/) | Role |
| --- | --- | --- |
| `index.html` | `src/index.html.js` | Login (OTC email → six-digit code). Redirects to `/map.html` on success. |
| `map.html` | `src/map.html.js` | Main map page (Leaflet/OpenStreetMap). Renders approved points only, shows the point popup, and logs a visit when "Abrir no Maps" is clicked by a logged-in user. |
| `menu.html` | `src/menu.html.js` | Citizen menu; reveals the ONG portal entry for ONG accounts. |
| `ong-menu.html` | `src/ong-menu.html.js` | ONG (moderator) panel: point table with access counts, approve/delete links, and an access-by-hour Chart.js overlay. |
| `point-create.html` | `src/point-create.html.js` | Form to register a new collection point. Citizens' points go in unapproved; ONG accounts see an auto-approval warning. |
| `user-report.html` | `src/user-report.html.js` | Report a problem with a point (pre-filled from `?pid=`). |
| `user-settings.html` | `src/user-settings.html.js` | Special-code redemption, logout, and account deletion. |
| `user-suggest.html` | — | Suggestion sketch using `sitescripts/create-suggest.js`; not wired to the API. |

Shared code:

- `src/logic/backend.js` — fetch wrappers for every API endpoint
  (`pullMapData`, `sendLoginCode`, `getLoginToken`, `checkLoginState`,
  `createReport`, `createPoint`, `deletePoint`, `approvePoint`,
  `invalidateLoginTokens`, `deleteAccount`, `redeemCode`, `logMapVisit`,
  `getPointAccesses`, `getPointAccessesAmount`, …).
- `src/logic/login.js` — cookie session helpers (`logintok`, `loginmail`
  cookies; `loggedIn()`, `login()`, `requestLogin()`, `invalidateLogin()`,
  `voluntaryInvalidateLogin()`, `deleteAccountAndInvalidate()`).
  Login validity is 7 days (`LOGIN_VALID_DAYS` in `src/index.html.js`).
- `src/logic/misc.js` — material descriptions (`descriptionFromPointTypes`),
  checkbox→boolean (`cbtob`), and the `?back=ong` helper.
- `src/logic/points.js` — `pointAccessNo(pid)`, the ONG-panel access counter.
- `src/logic/account.js` — `redeemSpecial(code)`, the special-code flow.
- `src/miscellaneous_elements/error_popup.js` — shared popup helpers.
- `styles/` — `general.css`, `topbar.css`, `mappage.css`. Pages share styling
  conventions here; keep new pages consistent with them.
- `fonts/` — Atkinson Hyperlegible Next (accessibility-oriented; licenses in
  `fonts/<name>/OFL.txt` — keep licenses with fonts).
- `manifest.webmanifest` + `images/icons/icon-{192,512}.png` — PWA install
  metadata; every page links it from `<head>`. Keep `start_url`/`scope` at
  root and both icon sizes present. There is no service worker, so the app is
  installable but **not** offline-capable. Changes are checked by
  `tests/manifest.test.js`.
- `sitescripts/` — draft scripts not wired into most pages; check before
  assuming a feature exists. `user-suggest.html` is the only page that loads
  `create-suggest.js`.

## Testing notes

- Tests are vitest suites in `tests/`, named `*-page.test.js` per page plus
  `backend.test.js`, `login.test.js`, `misc.test.js`, `points-logic.test.js`,
  `account.test.js`, `create-suggest.test.js`, `pages.test.js`, and
  `manifest.test.js`.
- There is **no jsdom** — `tests/support/dom.js` provides a hand-rolled stub
  (`makeElement`, `makeDocument`, `makeWindow`, `installCookieJar`). The stub
  includes a fake `body`, `getElementsByTagName`, `prepend`, and event
  listeners. Page modules are imported with `vi.resetModules()` and `logic/`
  modules are `vi.mock`ed; follow that pattern for new page tests.
- `npm test` runs vitest in **watch mode locally**; use `npx vitest run` for a
  single pass (CI sets the `CI` env var, which makes vitest run once).
- The ONG panel tests mock `chart.js` because the module imports `Chart` at
  load time and only constructs it when `?statpid=` is present.
