import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/logic/login.js', () => ({
  requestLogin: vi.fn(),
  login: vi.fn(),
  loggedIn: vi.fn(),
  invalidateLogin: vi.fn(),
}));

import { makeDocument, makeElement, makeWindow } from './support/dom.js';

const LOGIN_VALID_DAYS = 7;

async function loadPage({ loggedInResult = false, requestLoginResult = false, loginResult = false } = {}) {
  vi.resetModules();

  const loginModule = await import('../src/logic/login.js');
  loginModule.loggedIn.mockResolvedValue(loggedInResult);
  loginModule.requestLogin.mockResolvedValue(requestLoginResult);
  loginModule.login.mockResolvedValue(loginResult);

  await import('../src/index.html.js');

  return loginModule;
}

describe('login page', () => {
  let document;
  let window;
  let elements;

  beforeEach(() => {
    elements = {
      'login-email': makeElement(),
      'login-code': makeElement(),
      'id-verif-inputs': makeElement({ style: { display: 'none' } }),
      'send-code-button': makeElement(),
      'login-button': makeElement(),
    };
    document = makeDocument(elements);
    window = makeWindow();

    vi.stubGlobal('document', document);
    vi.stubGlobal('window', window);
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('redirects an already authenticated user to the map', async () => {
    await loadPage({ loggedInResult: { data: { ong: false } } });

    expect(window.location.href).toBe('/map.html');
    expect(elements['send-code-button'].listeners.click).toBeUndefined();
  });

  it('registers both buttons when the user is not authenticated', async () => {
    await loadPage();

    expect(elements['send-code-button'].listeners.click).toHaveLength(1);
    expect(elements['login-button'].listeners.click).toHaveLength(1);
    expect(window.location.href).toBe('http://localhost/');
  });

  it('does nothing when the e-mail field is empty', async () => {
    const loginModule = await loadPage();

    await elements['send-code-button'].click();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(loginModule.requestLogin).not.toHaveBeenCalled();
    expect(elements['login-email'].readOnly).toBe(false);
  });

  it('requests a code, locks the e-mail, and reveals the code inputs', async () => {
    const loginModule = await loadPage({ requestLoginResult: true });
    elements['login-email'].value = 'person@example.com';

    await elements['send-code-button'].click();
    await vi.waitFor(() => {
      expect(elements['id-verif-inputs'].style.display).toBe('block');
    });

    expect(loginModule.requestLogin).toHaveBeenCalledWith('person@example.com');
    expect(elements['login-email'].readOnly).toBe(true);
    expect(elements['send-code-button'].style.display).toBe('none');
  });

  it('leaves the form unchanged when the code request fails', async () => {
    const loginModule = await loadPage({ requestLoginResult: false });
    elements['login-email'].value = 'person@example.com';

    await elements['send-code-button'].click();
    await vi.waitFor(() => {
      expect(loginModule.requestLogin).toHaveBeenCalled();
    });
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(elements['id-verif-inputs'].style.display).toBe('none');
    expect(elements['send-code-button'].style.display).toBe('');
  });

  it('logs in with the e-mail and code and redirects to the map', async () => {
    const loginModule = await loadPage({ loginResult: true });
    elements['login-email'].value = 'person@example.com';
    elements['login-code'].value = '12345';

    await elements['login-button'].click();
    await vi.waitFor(() => {
      expect(window.location.href).toBe('/map.html');
    });

    expect(loginModule.login).toHaveBeenCalledWith(
      'person@example.com',
      '12345',
      LOGIN_VALID_DAYS,
    );
  });

  it('does not attempt a login without both e-mail and code', async () => {
    const loginModule = await loadPage({ loginResult: true });

    elements['login-email'].value = 'person@example.com';
    await elements['login-button'].click();
    await new Promise((resolve) => setTimeout(resolve, 0));

    elements['login-email'].value = '';
    elements['login-code'].value = '12345';
    await elements['login-button'].click();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(loginModule.login).not.toHaveBeenCalled();
  });

  it('stays on the page when the API refuses the code', async () => {
    const loginModule = await loadPage({ loginResult: false });
    elements['login-email'].value = 'person@example.com';
    elements['login-code'].value = '00000';

    await elements['login-button'].click();
    await vi.waitFor(() => {
      expect(loginModule.login).toHaveBeenCalled();
    });
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(window.location.href).toBe('http://localhost/');
  });
});
