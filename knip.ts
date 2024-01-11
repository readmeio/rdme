import type { KnipConfig } from 'knip';

import pkg from './package.json' assert { type: 'json' };

const config: KnipConfig = {
  entry: ['src/cmds/**', 'src/lib/hooks/*.ts', 'src/lib/help.ts'],
  ignore: ['bin/*.js', 'vitest.single-threaded.config.ts'],
  ignoreBinaries: ['ln', 'semantic-release'],
  ignoreDependencies: [...pkg.oclif.plugins, 'src', 'oclif'],
};

export default config;
