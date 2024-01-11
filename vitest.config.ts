// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: ['**/dist/**', '**/node_modules/**', '**/__fixtures__/**', '**/helpers/**', '**/single-threaded/**'],
    globalSetup: ['./__tests__/setup.js'],
    setupFiles: ['./__tests__/helpers/vitest.matchers.ts'],
  },
});
