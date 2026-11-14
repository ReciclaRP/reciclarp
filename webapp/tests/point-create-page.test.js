import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/logic/login.js', () => ({
  requestLogin: vi.fn(),
  login: vi.fn(),
  loggedIn: vi.fn(),
  invalidateLogin: vi.fn(),
}));

vi.mock('../src/logic/backend.js', () => ({
  pullMapData: vi.fn(),
  sendLoginCode: vi.fn(),
  getLoginToken: vi.fn(),
  checkLoginState: vi.fn(),
  createReport: vi.fn(),
  createPoint: vi.fn(),
}));

vi.mock('../src/miscellaneous_elements/error_popup.js', () => ({
  showErrorPopup: vi.fn(),
  showPopup: vi.fn(),
}));

import { makeDocument, makeElement, makeWindow } from './support/dom.js';

async function loadPage({
  search = '',
  loggedInResult = { email: 'person@example.com', token: 'token-1', data: { ong: false } },
  createResult = { type: 'okay' },
} = {}) {
  vi.resetModules();

  const backend = await import('../src/logic/backend.js');
  backend.createPoint.mockResolvedValue(createResult);

  const login = await import('../src/logic/login.js');
  login.loggedIn.mockResolvedValue(loggedInResult);

  const popup = await import('../src/miscellaneous_elements/error_popup.js');
  popup.showErrorPopup.mockClear();
  popup.showPopup.mockClear();

  const elements = {
    'ong-acc-warning': makeElement({ style: { display: 'none' } }),
    backbutton: makeElement({ href: '' }),
    pointdescription: makeElement({ value: 'Ecoponto Novo' }),
    lati: makeElement({ value: '-21.17' }),
    long: makeElement({ value: '-47.81' }),
    time_open: makeElement({ value: '07:00' }),
    time_close: makeElement({ value: '19:00' }),
    accepts_paper: makeElement({ value: 'on', checked: true }),
    accepts_metal: makeElement({ value: 'on', checked: true }),
    accepts_organic: makeElement({ value: '', checked: false }),
    accepts_biological: makeElement({ value: 'on', checked: true }),
    createbutton: makeElement(),
  };
  const window = makeWindow({ search });

  vi.stubGlobal('document', makeDocument(elements));
  vi.stubGlobal('window', window);

  await import('../src/point-create.html.js');

  return { backend, login, popup, elements, window };
}

describe('point creation page', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('shows the auto-approval warning for an ONG account', async () => {
    const { elements } = await loadPage({
      loggedInResult: { email: 'ong@example.com', token: 'token-1', data: { ong: true } },
    });

    await vi.waitFor(() => {
      expect(elements['ong-acc-warning'].style.display).toBe('block');
    });
  });

  it('keeps the auto-approval warning hidden for a regular account', async () => {
    const { elements } = await loadPage();

    await vi.waitFor(() => {
      expect(elements['ong-acc-warning'].style.display).toBe('none');
    });
  });

  it('points the back button at the menu by default', async () => {
    const { elements } = await loadPage();

    expect(elements.backbutton.href).toBe('/menu.html');
  });

  it('points the back button at the ONG portal when navigating from it', async () => {
    const { elements } = await loadPage({ search: '?back=ong' });

    expect(elements.backbutton.href).toBe('/ong-menu.html');
  });

  it('sends the form values to the API and redirects to the map', async () => {
    const { backend, elements, window } = await loadPage();

    await elements.createbutton.click();

    await vi.waitFor(() => {
      expect(backend.createPoint).toHaveBeenCalledTimes(1);
    });

    const [email, token, description, lati, long, timeOpen, timeClose, paper, metal, organic] =
      backend.createPoint.mock.calls[0];
    expect(email).toBe('person@example.com');
    expect(token).toBe('token-1');
    expect(description).toBe('Ecoponto Novo');
    expect(lati).toBe('-21.17');
    expect(long).toBe('-47.81');
    expect(timeOpen).toBe('07:00');
    expect(timeClose).toBe('19:00');
    expect(paper).toBe(true);
    expect(metal).toBe(true);
    expect(organic).toBe(false);

    expect(window.location.href).toBe('/map.html');
  });

  it('redirects back to the ONG portal after an ONG creates a point', async () => {
    const { elements, window } = await loadPage({
      search: '?back=ong',
      loggedInResult: { email: 'ong@example.com', token: 'token-1', data: { ong: true } },
    });

    await elements.createbutton.click();

    await vi.waitFor(() => {
      expect(window.location.href).toBe('/ong-menu.html');
    });
  });

  it('shows an error popup when the API refuses the point', async () => {
    const { elements, popup, window } = await loadPage({
      createResult: { type: 'error', description: 'Not enough data was provided.' },
    });

    await elements.createbutton.click();

    await vi.waitFor(() => {
      expect(popup.showErrorPopup).toHaveBeenCalled();
    });
    expect(window.location.href).toBe('http://localhost/');
  });

  it('clears the session when the visitor is no longer authenticated', async () => {
    const { login, elements } = await loadPage();

    await vi.waitFor(() => {
      expect(login.loggedIn).toHaveBeenCalled();
    });
    login.loggedIn.mockResolvedValue(false);

    await elements.createbutton.click();

    await vi.waitFor(() => {
      expect(login.invalidateLogin).toHaveBeenCalled();
    });
  });
});

// Known defect: formToPoint passes the paper checkbox as both the paper and
// biological arguments, so the biological selection is never sent.
it.todo('sends the biological material flag to the API');
