import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const chart = vi.hoisted(() => {
  const Chart = vi.fn();
  Chart.register = vi.fn();

  return { Chart, registerables: [] };
});

vi.mock('chart.js', () => ({ Chart: chart.Chart, registerables: chart.registerables }));

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
  deletePoint: vi.fn(),
  approvePoint: vi.fn(),
  getPointAccesses: vi.fn(),
}));

vi.mock('../src/logic/points.js', () => ({
  pointAccessNo: vi.fn(),
}));

import { makeDocument, makeElement, makeWindow } from './support/dom.js';

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

async function loadPage({
  withTable = true,
  search = '',
  accessCounts = { 1: 5, 2: 0 },
  loggedInResult = { email: 'ong@example.com', token: 'token-1', data: { ong: true } },
  accesses = { type: 'okay', data: [] },
  confirmResult = true,
} = {}) {
  vi.resetModules();

  const backend = await import('../src/logic/backend.js');
  backend.pullMapData.mockResolvedValue(points);
  backend.deletePoint.mockResolvedValue({ type: 'okay' });
  backend.approvePoint.mockResolvedValue({ type: 'okay' });
  backend.getPointAccesses.mockResolvedValue(accesses);

  const login = await import('../src/logic/login.js');
  login.loggedIn.mockResolvedValue(loggedInResult);

  const pointsLogic = await import('../src/logic/points.js');
  pointsLogic.pointAccessNo.mockImplementation(async (pid) => accessCounts[pid] ?? 0);

  const table = makeElement({ tagName: 'TABLE' });
  const elements = {
    'stats-overlay': makeElement({ style: { display: 'none' } }),
    ptno: makeElement(),
    statsChart: makeElement({ tagName: 'CANVAS' }),
  };
  if (withTable) {
    elements['points-table'] = table;
  }

  const window = makeWindow({
    search,
    confirm: vi.fn(() => confirmResult),
  });

  vi.stubGlobal('document', makeDocument(elements));
  vi.stubGlobal('window', window);

  await import('../src/ong-menu.html.js');

  return { backend, login, pointsLogic, table, elements, window };
}

describe('ONG point table page', () => {
  beforeEach(() => {
    chart.Chart.mockClear();
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
    expect(table.children[0].innerHTML).toContain('<td>5</td>');
  });

  it('renders the material list and the access count for every row', async () => {
    const { table } = await loadPage();

    await vi.waitFor(() => {
      expect(table.children).toHaveLength(points.length);
    });

    expect(table.children[1].innerHTML).toContain('biológicos, orgânicos.');
    expect(table.children[1].innerHTML).toContain('<td>0</td>');
  });

  it('offers delete to every point and approval/statistics depending on the state', async () => {
    const { table } = await loadPage();

    await vi.waitFor(() => {
      expect(table.children).toHaveLength(points.length);
    });

    const [approvedRow, pendingRow] = table.children;
    const approvedOptions = approvedRow.children[0];
    const pendingOptions = pendingRow.children[0];

    expect(approvedOptions.children.map((link) => link.textContent)).toEqual([
      'Deletar',
      'Estatísticas',
    ]);
    expect(approvedOptions.children[1].href).toBe('/ong-menu.html?statpid=1');
    expect(approvedRow.style.backgroundColor).toBeUndefined();

    expect(pendingOptions.children.map((link) => link.textContent)).toEqual([
      'Deletar',
      'Aprovar',
    ]);
    expect(pendingOptions.children[1].href).toBe('/ong-menu.html?approvepid=2');
    expect(pendingRow.style.backgroundColor).toBe('yellow');
  });

  it('does not request points when the table is absent', async () => {
    const { backend, table } = await loadPage({ withTable: false });
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(backend.pullMapData).not.toHaveBeenCalled();
    expect(table.children).toHaveLength(0);
  });

  it('renders the access-by-hour chart for the requested point', async () => {
    const { elements } = await loadPage({
      search: '?statpid=7',
      accesses: {
        type: 'okay',
        data: [
          { hour_accessed: '07:10' },
          { hour_accessed: '07:45' },
          { hour_accessed: '15:05' },
        ],
      },
    });

    expect(elements['stats-overlay'].style.display).toBe('block');
    expect(elements.ptno.textContent).toBe('7');
    expect(chart.Chart).toHaveBeenCalledTimes(1);

    const [canvas, config] = chart.Chart.mock.calls[0];
    expect(canvas).toBe(elements.statsChart);
    expect(config.type).toBe('bar');
    expect(config.data.datasets[0].label).toBe('nº de acessos');
    expect(config.data.datasets[0].data[7]).toBe(2);
    expect(config.data.datasets[0].data[15]).toBe(1);
  });

  it('deletes the requested point after confirmation', async () => {
    const { backend, window } = await loadPage({ search: '?deletepid=2' });

    expect(window.confirm).toHaveBeenCalled();
    expect(backend.deletePoint).toHaveBeenCalledWith('ong@example.com', 'token-1', '2');
    expect(window.location.href).toBe('/ong-menu.html');
  });

  it('approves the requested point after confirmation', async () => {
    const { backend, window } = await loadPage({ search: '?approvepid=2' });

    expect(backend.approvePoint).toHaveBeenCalledWith('ong@example.com', 'token-1', '2');
    expect(window.location.href).toBe('/ong-menu.html');
  });

  it('does not act when the confirmation is dismissed', async () => {
    const { backend } = await loadPage({
      search: '?deletepid=2',
      confirmResult: false,
    });

    expect(backend.deletePoint).not.toHaveBeenCalled();
  });
});
