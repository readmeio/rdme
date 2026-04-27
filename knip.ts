import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: ['bin/dev.js', 'bin/set-major-version-tag.js', 'src/lib/help.ts'],
  ignore: ['dist-gha/**'],

  ignoreBinaries: [
    // We're choosing not to include semantic release deps in our main dev-deps since we're only
    // using it in CI.
    'semantic-release',
  ],

  ignoreDependencies: [
    'eslint-plugin-readme', // This is used in our Oxlint config through another dependency.
    'tsx', // used in `bin/dev.js`
  ],

  oxfmt: {
    config: ['oxfmt.config.ts'],
  },

  oxlint: {
    config: ['oxlint.config.ts'],
  },

  vitest: {
    config: ['vitest.config.ts'],
    entry: ['__tests__/**/*.ts'],
  },
};

export default config;
