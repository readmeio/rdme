import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  ignore: ['bin/*.js'],
  ignoreBinaries: ['semantic-release'],
};

export default config;
