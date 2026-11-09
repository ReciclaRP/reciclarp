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
}));

import { makeDocument, makeElement, makeWindow } from './support/dom.js';

const points = [
  {
    pid: 2,
    pointdescription: 'R. Alberto de Oliveira, 1988',
    lati: -21.17,
    long: -47.81,
    time_open: '9:00',
    time_close: '17:00',
    accepts_paper: 1,
    accepts_metal: 1,
    accepts_organic: 0,
    accepts_biological: 0,
    approved: 1,
  },
];

async function loadPage({
  search = '?pid=2',
  loggedInResult = { email: 'person@example.com', token: 'token-1', data: {} },
  textbox = 'O ponto está cheio',
  category = 'pointfull',
  availablePoints = points,
} = {}) {
  vi.resetModules();

  const backend = await import('../src/logic/backend.js');
  backend.pullMapData.mockResolvedValue(availablePoints);
  backend.createReport.mockResolvedValue({ type: 'okay' });

  const login = await import('../src/logic/login.js');
  login.loggedIn.mockResolvedValue(loggedInResult);

  const elements = {
    pnum: makeElement(),
    raddr: makeElement(),
    tfrom: makeElement(),
    tto: makeElement(),
    itemnames: makeElement(),
    'report-textbox': makeElement({ value: textbox }),
    'select-problemas': makeElement({ value: category }),
    'report-button': makeElement(),
  };

  vi.stubGlobal('document', makeDocument(elements));
  vi.stubGlobal('window', makeWindow({ search }));

  await import('../src/user-report.html.js');

  return { backend, login, elements };
}

describe('user report page', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('pre-fills the point details based on the pid query parameter', async () => {
    const { elements } = await loadPage();

    expect(elements.pnum.innerHTML).toBe(2);
    expect(elements.raddr.innerHTML).toBe('R. Alberto de Oliveira, 1988');
    expect(elements.tfrom.innerHTML).toBe('9:00');
    expect(elements.tto.innerHTML).toBe('17:00');
    expect(elements.itemnames.innerHTML).toBe('metal, papel.');
  });

  it('leaves the placeholders untouched when the pid is absent', async () => {
    const { elements } = await loadPage({ search: '' });

    expect(elements.pnum.innerHTML).toBe('');
    expect(elements.raddr.innerHTML).toBe('');
    expect(elements.itemnames.innerHTML).toBe('');
  });

  it('leaves the placeholders untouched when the point does not exist', async () => {
    const { elements } = await loadPage({ search: '?pid=999' });

    expect(elements.pnum.innerHTML).toBe('');
    expect(elements.raddr.innerHTML).toBe('');
  });

  it('submits the report for the logged-in user and selected point', async () => {
    const { backend, elements } = await loadPage();

    await elements['report-button'].click();
    await vi.waitFor(() => {
      expect(backend.createReport).toHaveBeenCalled();
    });

    expect(backend.createReport).toHaveBeenCalledWith(
      'person@example.com',
      'token-1',
      '2',
      {
        description: 'O ponto está cheio',
        problem_kind: 'pointfull',
      },
    );
  });

  it('clears the login when the visitor is not authenticated', async () => {
    const { backend, login, elements } = await loadPage({ loggedInResult: false });

    await elements['report-button'].click();
    await vi.waitFor(() => {
      expect(login.invalidateLogin).toHaveBeenCalled();
    });

    expect(backend.createReport).not.toHaveBeenCalled();
  });

  it('does not submit a report with an empty description', async () => {
    const { backend, elements } = await loadPage({ textbox: '' });

    await elements['report-button'].click();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(backend.createReport).not.toHaveBeenCalled();
  });

  it('does not submit a report without a selected category', async () => {
    const { backend, elements } = await loadPage({ category: '' });

    await elements['report-button'].click();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(backend.createReport).not.toHaveBeenCalled();
  });
});
