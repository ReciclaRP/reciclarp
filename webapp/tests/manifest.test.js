import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const webappRoot = fileURLToPath(new URL('..', import.meta.url));
const manifestPath = path.join(webappRoot, 'manifest.webmanifest');

const readManifest = () => JSON.parse(readFileSync(manifestPath, 'utf8'));

const pages = readdirSync(webappRoot).filter((file) => file.endsWith('.html'));

describe('PWA manifest', () => {
  it('is a valid JSON manifest at the webapp root', () => {
    expect(existsSync(manifestPath), 'webapp/manifest.webmanifest should exist').toBe(true);
    expect(() => readManifest()).not.toThrow();
  });

  it('declares the identity and display mode needed for installation', () => {
    const manifest = readManifest();

    expect(manifest.name).toBe('ReciclaRP');
    expect(manifest.lang).toBe('pt-BR');
    expect(manifest.start_url).toBe('/');
    expect(manifest.scope).toBe('/');
    expect(['standalone', 'minimal-ui', 'fullscreen']).toContain(manifest.display);
  });

  it('declares theme and splash colors', () => {
    const manifest = readManifest();

    expect(manifest.background_color).toMatch(/^#[0-9a-f]{6}$/i);
    expect(manifest.theme_color).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('ships 192px and 512px icons that exist on disk', () => {
    const { icons } = readManifest();
    const sizes = icons.map((icon) => icon.sizes);

    expect(sizes).toContain('192x192');
    expect(sizes).toContain('512x512');

    for (const icon of icons) {
      expect(icon.type).toBe('image/png');
      expect(icon.src.startsWith('/'), `${icon.src} should be an absolute path`).toBe(true);
      expect(
        existsSync(path.join(webappRoot, icon.src.slice(1))),
        `manifest references missing icon ${icon.src}`,
      ).toBe(true);
    }
  });

  it('is linked from every page', () => {
    for (const page of pages) {
      const html = readFileSync(path.join(webappRoot, page), 'utf8');

      expect(html, `${page} should link the manifest`).toContain(
        '<link rel="manifest" href="/manifest.webmanifest" />',
      );
    }
  });
});
