import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  ignore: ['bin/*.js'],
  ignoreBinaries: ['semantic-release'],
  ignoreDependencies: ['@vitest/coverage-v8'],
};

export default config;
