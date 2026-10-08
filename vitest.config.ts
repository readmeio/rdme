import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { configDefaults, coverageConfigDefaults, defineConfig } from 'vitest/config';

// Always resolve `undici` to the repo-root install. A package-local copy would make
// `vi.mock('undici')` patch the wrong module while `@apidevtools/json-schema-ref-parser`
// (bundled into `@readme/openapi-parser`) keeps using a different one, bypassing `nock`.
const rootUndici = path.resolve(fileURLToPath(new URL('.', import.meta.url)), 'node_modules/undici');

export default defineConfig({
  resolve: {
    alias: {
      undici: rootUndici,
    },
  },
  test: {
    coverage: {
      // Vitest 5 matches include/exclude against project-relative paths and no longer
      // ships a default exclude list, so pin coverage to source files.
      include: ['src'],
      exclude: [...coverageConfigDefaults.exclude, '**/dist-gha/**'],
    },
    // We'll defer to `@oclif/test` for console interception
    // so we can run assertions against console output.
    disableConsoleIntercept: true,
    env: {
      /**
       * The `chalk` and `colors` libraries have trouble with tests sometimes in test snapshots so
       * we're disabling colorization here for all tests.
       *
       * @see {@link https://github.com/chalk/supports-color/issues/106}
       */
      FORCE_COLOR: '0',
      /**
       * Sets our test `NODE_ENV` to a custom value in case of false positives if someone is using this
       * tool in a testing environment.
       */
      NODE_ENV: 'rdme-test',
    },
    exclude: [
      '**/__fixtures__/**',
      '**/dist-gha/**',
      '**/helpers/**',
      '**/__snapshots__/**',
      ...configDefaults.exclude,
    ],
    globalSetup: 'test/helpers/global-setup.ts',
    server: {
      deps: {
        // Ensure OpenAPI URL fetches go through Vitest's module graph so our
        // `vi.mock('undici')` / `vi.mock('node:dns/promises')` patches apply.
        inline: ['@readme/openapi-parser', 'oas-normalize'],
      },
    },
    watchTriggerPatterns: [
      {
        pattern: /test\/__fixtures__\/([A-z,-]+)\/([A-z,-/.]+)/g,
        testsToRun: (_file, match) => {
          const fixtureDirectory = match[1];
          if (['docs', 'reference', 'changelog'].includes(fixtureDirectory)) {
            if (fixtureDirectory === 'changelog') {
              return 'test/commands/changelog/upload.test.ts';
            }
            return 'test/commands/page/upload.test.ts';
          }

          return null;
        },
      },
      {
        pattern: /test\/__fixtures__\/([A-z,-]+)\/(.*).json/g,
        testsToRun: (_file, match) => {
          const fixtureDirectory = match[1];
          if (fixtureDirectory === 'circular-ref-oas') {
            return 'test/commands/openapi/resolve.test.ts';
          }

          return null;
        },
      },
    ],
  },
});
