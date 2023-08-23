// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      branches: 80,
      functions: 80,
      lines: 90,
      statements: 90,
      reporter: 'text',
    },
    exclude: ['**/dist/**', '**/node_modules/**', '**/__fixtures__/**', '**/helpers/**', '**/__snapshots__/**'],
    globalSetup: ['./__tests__/setup.js'],
    include: ['**/single-threaded/**'],
    setupFiles: ['./__tests__/helpers/vitest.matchers.ts'],

    /**
     * We can't run tests with `threads` on because we use `process.chdir()` in some tests and
     * that isn't available in worker threads, and it's way too much work to mock out an entire
     * filesystem and `fs` calls for the tests that use it.
     *
     * @see {@link https://github.com/vitest-dev/vitest/issues/566}
     */
    threads: false,
  },
});
