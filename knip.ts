import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  ignore: ['bin/*.js', 'config/default.js'],
  ignoreBinaries: ['semantic-release'],
  ignoreDependencies: ['editor'],
};

export default config;
