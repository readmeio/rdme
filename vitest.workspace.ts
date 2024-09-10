// eslint-disable-next-line import/no-extraneous-dependencies
import { defineWorkspace } from 'vitest/config';

const sharedExclude = [
  '**/dist/**',
  '**/node_modules/**',
  '**/__fixtures__/**',
  '**/helpers/**',
  '**/__snapshots__/**',
];

const sharedOpts = {
  globalSetup: ['./__tests__/setup.js'],
  setupFiles: ['./__tests__/helpers/vitest.matchers.ts'],
};

export default defineWorkspace([
  {
    /**
     * Our default test suite
     */
    test: {
      exclude: [...sharedExclude, '**/single-threaded/**'],
      name: 'default',
      pool: 'threads',
      ...sharedOpts,
    },
  },
  {
    /**
     * Our single-threaded test suite.
     * Only tests that use `process.chdir()` should be run using this config.
     */
    test: {
      exclude: sharedExclude,
      include: ['**/single-threaded/**'],
      name: 'single-threaded',
      /**
       * We can't run tests with `threads` on because we use `process.chdir()` in some tests and
       * that isn't available in worker threads, and it's way too much work to mock out an entire
       * filesystem and `fs` calls for the tests that use it.
       *
       * @see {@link https://github.com/vitest-dev/vitest/issues/566}
       */
      pool: 'forks',
      ...sharedOpts,
    },
  },
]);
