import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/logic/login.js', () => ({
  requestLogin: vi.fn(),
  login: vi.fn(),
  loggedIn: vi.fn(),
  invalidateLogin: vi.fn(),
}));

import { makeDocument, makeElement } from './support/dom.js';

async function loadPage({ loggedInResult, withOngMenu = true } = {}) {
  vi.resetModules();

  const loginModule = await import('../src/logic/login.js');
  loginModule.loggedIn.mockResolvedValue(loggedInResult);

  const elements = withOngMenu
    ? { ongmenu: makeElement({ style: { display: 'none' } }) }
    : {};
  vi.stubGlobal('document', makeDocument(elements));

  await import('../src/menu.html.js');

  return { loginModule, elements };
}

describe('menu page', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows the ONG portal for an ONG account', async () => {
    const { elements } = await loadPage({
      loggedInResult: { data: { ong: true } },
    });

    expect(elements.ongmenu.style.display).toBe('block');
  });

  it('keeps the ONG portal hidden for a regular account', async () => {
    const { elements } = await loadPage({
      loggedInResult: { data: { ong: false } },
    });

    expect(elements.ongmenu.style.display).toBe('none');
  });

  it('keeps the ONG portal hidden when the user is not logged in', async () => {
    const { elements } = await loadPage({ loggedInResult: false });

    expect(elements.ongmenu.style.display).toBe('none');
  });

  it('does not fail when the page has no ONG menu element', async () => {
    await expect(
      loadPage({ loggedInResult: { data: { ong: true } }, withOngMenu: false }),
    ).resolves.toBeDefined();
  });
});
