import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  ignore: ['bin/*.js', 'vitest.single-threaded.config.ts'],
  ignoreBinaries: ['semantic-release'],
  ignoreDependencies: ['editor'],
};

export default config;
