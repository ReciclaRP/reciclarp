import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const webappRoot = fileURLToPath(new URL('..', import.meta.url));
const readPage = (file) => readFileSync(path.join(webappRoot, file), 'utf8');

const pages = [
  {
    file: 'index.html',
    script: 'src/index.html.js',
    ids: [
      'login-email',
      'login-code',
      'id-verif-inputs',
      'send-code-button',
      'login-button',
    ],
  },
  {
    file: 'map.html',
    script: 'src/map.html.js',
    ids: ['map', 'location-popup'],
  },
  {
    file: 'menu.html',
    script: 'src/menu.html.js',
    ids: ['ongmenu'],
  },
  {
    file: 'account-settings.html',
    script: null,
    ids: [],
  },
  {
    file: 'user-report.html',
    script: 'src/user-report.html.js',
    ids: [
      'pnum',
      'raddr',
      'tfrom',
      'tto',
      'itemnames',
      'select-problemas',
      'report-textbox',
      'report-button',
    ],
  },
  {
    file: 'ong-menu.html',
    script: 'src/ong-menu.html.js',
    ids: ['points-table'],
  },
  {
    file: 'ong-create.html',
    script: 'sitescripts/create-suggest.js',
    ids: [],
  },
  {
    file: 'user-suggest.html',
    script: 'sitescripts/create-suggest.js',
    ids: [],
  },
  {
    file: 'ong-pontos.html',
    script: null,
    ids: [],
  },
];

describe('web application pages', () => {
  it.each(pages)('$file is a complete HTML document', ({ file }) => {
    const html = readPage(file);

    expect(html).toMatch(/^<!doctype html>/i);
    expect(html).toMatch(/<html lang="[^"]+">/);
    expect(html).toMatch(/<meta name="viewport"/);
    expect(html).toMatch(/<title>ReciclaRP<\/title>/);
  });

  it.each(pages.filter((page) => page.script))(
    '$file loads $script from an existing file',
    ({ file, script }) => {
      const html = readPage(file);

      expect(html).toContain(`src="/${script}"`);
      expect(existsSync(path.join(webappRoot, script))).toBe(true);
    },
  );

  it.each(pages.filter((page) => page.ids.length > 0))(
    '$file contains every element id used by its script',
    ({ file, ids }) => {
      const html = readPage(file);

      for (const id of ids) {
        expect(html, `${file} should contain id="${id}"`).toContain(`id="${id}"`);
      }
    },
  );

  it('every page references existing local styles, images, and scripts', () => {
    const localAssetPattern = /(?:src|href)="(\/(?:images|styles|src|sitescripts)\/[^"]+)"/g;

    for (const { file } of pages) {
      const html = readPage(file);
      let match;

      while ((match = localAssetPattern.exec(html)) !== null) {
        const asset = match[1].slice(1);
        expect(
          existsSync(path.join(webappRoot, asset)),
          `${file} references missing asset ${match[1]}`,
        ).toBe(true);
      }
    }
  });

  it('the login page exposes the e-mail and verification inputs', () => {
    const html = readPage('index.html');

    expect(html).toMatch(/<input type="email" id="login-email">/);
    expect(html).toMatch(/<input type="number"[^>]*id="login-code"/);
    expect(html).toContain('Um código de verificação foi encaminhado ao seu e-mail.');
  });

  it('the map page contains the map container and popup', () => {
    const html = readPage('map.html');

    expect(html).toContain('<div class="popup-div" id="location-popup">');
    expect(html).toContain('<div class="map-div" id="map">');
  });

  it('the menu hides the ONG portal by default', () => {
    const html = readPage('menu.html');

    expect(html).toMatch(/id="ongmenu"\s+style="display: none;"/);
  });

  it('both point suggestion forms use the structure expected by create-suggest.js', () => {
    for (const file of ['user-suggest.html', 'ong-create.html']) {
      const html = readPage(file);
      const form = html.slice(html.indexOf('class="point-form"'));

      expect(form.match(/type="text"/g)).toHaveLength(1);
      expect(form.match(/type="time"/g)).toHaveLength(2);
      expect(form.match(/type="checkbox"/g)).toHaveLength(4);
      expect(form.match(/type="submit"/g)).toHaveLength(1);
      expect(form).toContain("putData('suggest')");
    }
  });

  it('the report page offers every problem category supported by the API', () => {
    const html = readPage('user-report.html');

    for (const category of ['pointabsent', 'pointfull', 'pointtime']) {
      expect(html).toContain(`<option value="${category}">`);
    }
  });

  it('the report page pre-fills the fields populated from the point id', () => {
    const html = readPage('user-report.html');

    expect(html).toContain('<span id="pnum">');
    expect(html).toContain('<span id="tfrom">');
    expect(html).toContain('<span id="tto">');
    expect(html).toContain('<p id="raddr">');
    expect(html).toContain('<span id="itemnames">');
  });
});

// Known defect: pages link to /user-settings.html, but the implemented account
// page is named /account-settings.html.
it.todo('all internal .html links resolve to existing pages');

// Known defect: pages request /favicon.svg, which is not present in webapp/.
it.todo('all pages reference an existing favicon');
