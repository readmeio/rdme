import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: ['bin/dev.js', 'bin/set-major-version-tag.js', 'src/lib/help.ts'],
  ignore: ['dist-gha/**'],
  // we're choosing not to include semantic release deps in our main dev-deps
  // since we're only using it in CI
  ignoreBinaries: ['semantic-release'],
  // used in `bin/dev.js`
  ignoreDependencies: ['tsx'],
};

export default config;
