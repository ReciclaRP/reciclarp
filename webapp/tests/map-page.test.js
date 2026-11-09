import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const leaflet = vi.hoisted(() => {
  const markers = [];
  const tileLayerAddTo = vi.fn();
  const mapObject = {
    setView: vi.fn(() => mapObject),
  };
  const L = {
    map: vi.fn(() => mapObject),
    tileLayer: vi.fn(() => ({ addTo: tileLayerAddTo })),
    marker: vi.fn((coordinates) => {
      const marker = {
        coordinates,
        handlers: {},
        addTo: vi.fn(() => marker),
        on: vi.fn((event, handler) => {
          marker.handlers[event] = handler;
          return marker;
        }),
      };
      markers.push(marker);
      return marker;
    }),
  };

  return { L, markers, mapObject, tileLayerAddTo };
});

vi.mock('leaflet', () => ({ default: leaflet.L }));

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

async function loadPage({ availablePoints = points } = {}) {
  vi.resetModules();
  leaflet.markers.length = 0;

  const backend = await import('../src/logic/backend.js');
  backend.pullMapData.mockResolvedValue(availablePoints);

  const mapElement = makeElement();
  const popup = makeElement();
  const elements = {
    '#map': mapElement,
    'location-popup': popup,
  };
  vi.stubGlobal('document', makeDocument(elements));

  await import('../src/map.html.js');

  return { backend, mapElement, popup };
}

describe('map page', () => {
  beforeEach(() => {
    leaflet.L.map.mockClear();
    leaflet.L.tileLayer.mockClear();
    leaflet.L.marker.mockClear();
    leaflet.mapObject.setView.mockClear();
    leaflet.tileLayerAddTo.mockClear();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('creates a map centred on Ribeirão Preto with the OpenStreetMap layer', async () => {
    const { mapElement } = await loadPage();

    expect(leaflet.L.map).toHaveBeenCalledWith(mapElement);
    expect(leaflet.mapObject.setView).toHaveBeenCalledWith([-21.1684, -47.8109], 13);
    expect(leaflet.L.tileLayer).toHaveBeenCalledWith(
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      },
    );
    expect(leaflet.tileLayerAddTo).toHaveBeenCalledWith(leaflet.mapObject);
  });

  it('adds one marker per point returned by the API', async () => {
    await loadPage();

    expect(leaflet.L.marker).toHaveBeenCalledTimes(points.length);
    expect(leaflet.markers.map((marker) => marker.coordinates)).toEqual([
      [points[0].lati, points[0].long],
      [points[1].lati, points[1].long],
    ]);

    for (const marker of leaflet.markers) {
      expect(marker.addTo).toHaveBeenCalledWith(leaflet.mapObject);
      expect(marker.on).toHaveBeenCalledWith('click', expect.any(Function));
    }
  });

  it('does not create markers when the API returns no points', async () => {
    await loadPage({ availablePoints: [] });

    expect(leaflet.L.marker).not.toHaveBeenCalled();
  });

  it('opens the popup with the details of the clicked point', async () => {
    const { popup } = await loadPage();
    const marker = leaflet.markers[0];

    await marker.handlers.click({
      latlng: { lat: points[0].lati, lng: points[0].long },
      containerPoint: { x: 12, y: 34 },
    });

    expect(popup.innerHTML).toContain('Ponto nº 1');
    expect(popup.innerHTML).toContain('7:00 - 19:00');
    expect(popup.innerHTML).toContain('Ecoponto Central');
    expect(popup.innerHTML).toContain('metal, papel.');
    expect(popup.innerHTML).toContain(
      'https://maps.google.com/?q=-21.17,-47.81',
    );
    expect(popup.innerHTML).toContain('/user-report.html?pid=1');
    expect(popup.style.display).toBe('block');
    expect(popup.style.left).toBe('12px');
    expect(popup.style.top).toBe('34px');
  });

  it('opens the details of the second point independently', async () => {
    const { popup } = await loadPage();
    const marker = leaflet.markers[1];

    await marker.handlers.click({
      latlng: { lat: points[1].lati, lng: points[1].long },
      containerPoint: { x: 0, y: 0 },
    });

    expect(popup.innerHTML).toContain('Ponto nº 2');
    expect(popup.innerHTML).toContain('8:00 - 18:00');
    expect(popup.innerHTML).toContain('biológicos, orgânicos.');
    expect(popup.innerHTML).toContain('/user-report.html?pid=2');
  });

  it('leaves the popup hidden when no point matches the click', async () => {
    const { popup } = await loadPage();

    await leaflet.markers[0].handlers.click({
      latlng: { lat: 0, lng: 0 },
      containerPoint: { x: 5, y: 6 },
    });

    expect(popup.innerHTML).toBe('');
    expect(popup.style.display).toBe('');
  });
});
