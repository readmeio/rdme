import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  ignore: ['bin/*.cjs', 'bin/*.js', 'config/default.cjs', 'vitest.single-threaded.config.ts'],
  ignoreBinaries: ['semantic-release'],
  ignoreDependencies: ['editor'],
};

export default config;
