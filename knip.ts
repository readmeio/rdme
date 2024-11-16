import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: ['src/index.ts', 'src/lib/help.ts', 'bin/*.js'],
  ignore: ['dist-gha/**'],
  ignoreBinaries: ['semantic-release'],
  ignoreDependencies: ['oclif'],
};

export default config;
