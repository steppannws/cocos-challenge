/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import { describe, expect, it } from 'vitest';
// The palette file, not '@/theme': that also exports hooks, which import react-native.
import { brand } from '@/theme/palettes';

/**
 * Device-only assumptions that Node tests cannot see.
 * In a past app every unit test passed while the app was blank on iOS: `uuid` needs
 * crypto.getRandomValues, Node has it, React Native does not.
 * Add a check here whenever a bug only showed up on a device.
 */
const root = fileURLToPath(new URL('..', import.meta.url));
const read = (path: string): string => readFileSync(join(root, path), 'utf8');
const pkg = JSON.parse(read('package.json')) as { dependencies?: Record<string, string> };

describe('platform requirements', () => {
  it('does not depend on uuid', () => {
    expect(pkg.dependencies?.uuid, 'uuid throws on device without a polyfill').toBeUndefined();
  });

  it('initializes i18n before anything renders', () => {
    const app = read('App.tsx');
    const i18nAt = app.indexOf("import '@/i18n'");
    expect(i18nAt, "App.tsx must import '@/i18n'").toBeGreaterThanOrEqual(0);
    expect(i18nAt, "'@/i18n' must be the first import").toBe(app.search(/^import\b/m));
  });

  it('never allows cleartext traffic in release builds', () => {
    // The React Native Gradle plugin fills the placeholder: true for debug, false for release.
    const manifest = read('android/app/src/main/AndroidManifest.xml');
    expect(manifest).toContain('android:usesCleartextTraffic="${usesCleartextTraffic}"');
  });

  it('declares every variable env.ts reads in .env', () => {
    const keys = [...read('src/config/env.ts').matchAll(/^\s+([A-Z][A-Z0-9_]+):/gm)].map(
      (m) => m[1],
    );
    expect(keys.length).toBeGreaterThan(0);
    const dotenv = read('.env');
    for (const key of keys) {
      expect(dotenv, `${key} is missing from .env`).toMatch(new RegExp(`^${key}=`, 'm'));
    }
  });

  it('paints the splash screen with the theme hero color', () => {
    // The native splash and its JS copy share this manifest. If the theme drifts, the
    // hand-off shows a color jump. Regenerate with: pnpm assets:splash
    const manifest = JSON.parse(read('src/assets/bootsplash/manifest.json')) as {
      background: string;
    };
    expect(manifest.background.toUpperCase()).toBe(brand.navy.toUpperCase());
  });
});
