import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: ['src/index.ts', 'src/lib/hooks/*.ts', 'src/lib/help.ts'],
  ignore: ['bin/*.js', 'gha-dist/**'],
  ignoreBinaries: ['semantic-release'],
  ignoreDependencies: ['oclif'],
};

export default config;
