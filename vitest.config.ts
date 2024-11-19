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
    onConsoleLog(log: string, type: 'stderr' | 'stdout'): boolean | void {
      // hides `rdme open` deprecation warning
      return !(log.includes('`rdme open` is deprecated and will be removed in a future release') && type === 'stderr');
    },
    setupFiles: ['./__tests__/helpers/vitest.matchers.ts'],
  },
});
