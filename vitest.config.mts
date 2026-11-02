/// <reference types="node" />
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';

// Logic tests only, in Node. Do not import react-native here: mock native modules with vi.mock.
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  define: { __DEV__: true },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
  },
});
