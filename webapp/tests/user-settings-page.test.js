import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/logic/login.js', () => ({
  requestLogin: vi.fn(),
  login: vi.fn(),
  loggedIn: vi.fn(),
  invalidateLogin: vi.fn(),
  voluntaryInvalidateLogin: vi.fn(),
  deleteAccountAndInvalidate: vi.fn(),
}));

vi.mock('../src/logic/account.js', () => ({
  redeemSpecial: vi.fn(),
}));

vi.mock('../src/miscellaneous_elements/error_popup.js', () => ({
  showErrorPopup: vi.fn(),
  showPopup: vi.fn(),
}));

import { makeDocument, makeElement } from './support/dom.js';

async function loadPage({ redeemResult = false, code = 'CODIGO-XYZ' } = {}) {
  vi.resetModules();

  const login = await import('../src/logic/login.js');
  login.voluntaryInvalidateLogin.mockClear();
  login.deleteAccountAndInvalidate.mockClear();

  const account = await import('../src/logic/account.js');
  account.redeemSpecial.mockResolvedValue(redeemResult);

  const popup = await import('../src/miscellaneous_elements/error_popup.js');
  popup.showErrorPopup.mockClear();
  popup.showPopup.mockClear();

  const elements = {
    'special-code-input': makeElement({ value: code }),
    'special-code-submit': makeElement(),
    'logout-button': makeElement(),
    'deleteacc-button': makeElement(),
  };

  vi.stubGlobal('document', makeDocument(elements));

  await import('../src/user-settings.html.js');

  return { login, account, popup, elements };
}

describe('user settings page', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('logs out through the session helper', async () => {
    const { login, elements } = await loadPage();

    await elements['logout-button'].click();

    expect(login.voluntaryInvalidateLogin).toHaveBeenCalledTimes(1);
  });

  it('deletes the account through the session helper', async () => {
    const { login, elements } = await loadPage();

    await elements['deleteacc-button'].click();

    expect(login.deleteAccountAndInvalidate).toHaveBeenCalledTimes(1);
  });

  it('redeems the special code and reports success', async () => {
    const { account, popup, elements } = await loadPage({ redeemResult: true });

    await elements['special-code-submit'].click();

    await vi.waitFor(() => {
      expect(account.redeemSpecial).toHaveBeenCalledWith('CODIGO-XYZ');
    });
    expect(popup.showPopup).toHaveBeenCalledWith(
      'Código resgatado com sucesso!',
      'green',
      'white',
    );
    expect(popup.showErrorPopup).not.toHaveBeenCalled();
  });

  it('reports an incorrect special code', async () => {
    const { popup, elements } = await loadPage({ redeemResult: false });

    await elements['special-code-submit'].click();

    await vi.waitFor(() => {
      expect(popup.showErrorPopup).toHaveBeenCalledWith('Código incorreto.');
    });
    expect(popup.showPopup).not.toHaveBeenCalled();
  });
});
