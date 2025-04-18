import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: ['src/index.ts', 'src/types.ts', 'src/lib/help.ts', 'bin/*.js'],
  ignore: ['dist-gha/**'],
  // we're choosing not to include semantic release deps in our main dev-deps
  // since we're only using it in CI
  ignoreBinaries: ['semantic-release'],
  // used in `bin/dev.js`
  ignoreDependencies: ['tsx'],
};

export default config;
