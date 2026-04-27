import oxfmtConfig from '@readme/oxlint-config/oxfmt';
import { defineConfig } from 'oxfmt';

export default defineConfig(
  Object.assign(structuredClone(oxfmtConfig), {
    sortImports: {
      ...oxfmtConfig.sortImports,
    },
    ignorePatterns: [
      // invalid files
      'test/__fixtures__/invalid-json/yikes.json',

      // test result artifacts
      'coverage/',

      // release build artifacts
      'CHANGELOG.md',
      'dist/',
      'documentation/commands',
      'dist-gha/',
    ],
  }),
);
