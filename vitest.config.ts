// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      reporter: 'text',
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 90,
        statements: 90,
      },
    },
    exclude: ['**/dist/**', '**/node_modules/**', '**/__fixtures__/**', '**/helpers/**', '**/single-threaded/**'],
    globalSetup: ['./__tests__/setup.js'],
    setupFiles: ['./__tests__/helpers/vitest.matchers.ts'],
  },
});
