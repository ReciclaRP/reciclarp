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

import { makeDocument, makeElement } from './support/dom.js';

const points = [
  {
    pid: 1,
    pointdescription: 'Ecoponto Central',
    lati: -21.17,
    long: -47.81,
    time_open: '7:00',
    time_close: '19:00',
    accepts_paper: 1,
    accepts_metal: 1,
    accepts_organic: 0,
    accepts_biological: 0,
    approved: 1,
  },
  {
    pid: 2,
    pointdescription: 'Ecoponto Norte',
    lati: -21.11,
    long: -47.79,
    time_open: '8:00',
    time_close: '18:00',
    accepts_paper: 0,
    accepts_metal: 0,
    accepts_organic: 1,
    accepts_biological: 1,
    approved: 0,
  },
];

async function loadPage({ withTable = true } = {}) {
  vi.resetModules();

  const backend = await import('../src/logic/backend.js');
  backend.pullMapData.mockResolvedValue(points);

  const table = makeElement({ tagName: 'TABLE' });
  const elements = withTable ? { 'points-table': table } : {};
  vi.stubGlobal('document', makeDocument(elements));

  await import('../src/ong-menu.html.js');

  return { backend, table };
}

describe('ONG point table page', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('renders one row per point returned by the API', async () => {
    const { table } = await loadPage();

    await vi.waitFor(() => {
      expect(table.children).toHaveLength(points.length);
    });

    expect(table.children[0].innerHTML).toContain('<td>1</td>');
    expect(table.children[0].innerHTML).toContain('Ecoponto Central');
    expect(table.children[0].innerHTML).toContain('7:00');
    expect(table.children[0].innerHTML).toContain('19:00');
    expect(table.children[0].innerHTML).toContain('metal, papel.');
    expect(table.children[0].innerHTML).toContain('-21.17');
    expect(table.children[0].innerHTML).toContain('-47.81');
    expect(table.children[0].innerHTML).toContain('USERNAME_HERE');
  });

  it('renders the material list and approval flag for every row', async () => {
    const { table } = await loadPage();

    await vi.waitFor(() => {
      expect(table.children).toHaveLength(points.length);
    });

    expect(table.children[1].innerHTML).toContain('biológicos, orgânicos.');
    expect(table.children[1].innerHTML).toContain('<td>0</td>');
  });

  it('does not request points when the table is absent', async () => {
    const { backend, table } = await loadPage({ withTable: false });
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(backend.pullMapData).not.toHaveBeenCalled();
    expect(table.children).toHaveLength(0);
  });
});
