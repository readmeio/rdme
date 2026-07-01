import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: ['bin/dev.js', 'bin/set-major-version-tag.js', 'src/lib/help.ts'],
  ignore: ['dist-gha/**'],
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
    entry: ['test/**/*.ts'],
  },
};

export default config;
