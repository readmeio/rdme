import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  ignore: ['bin/*.js'],
  ignoreBinaries: ['semantic-release'],
  // used in husky commit hooks
  ignoreDependencies: ['@commitlint/cli'],
};

export default config;
