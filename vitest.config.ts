// eslint-disable-next-line import/no-extraneous-dependencies
import { coverageConfigDefaults, configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      exclude: [...coverageConfigDefaults.exclude, '**/dist-gha/**'],
    },
    exclude: [
      '**/__fixtures__/**',
      '**/dist-gha/**',
      '**/helpers/**',
      '**/__snapshots__/**',
      ...configDefaults.exclude,
    ],
    globalSetup: ['./__tests__/setup.js'],
    setupFiles: ['./__tests__/helpers/vitest.matchers.ts'],
  },
});
