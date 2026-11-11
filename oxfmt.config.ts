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
      '.vitest/',
      'coverage/',

      // release build artifacts
      'CHANGELOG.md',
      'dist/',
      // Regenerated literal type. Formatting it rewrites ~1.3MB for no behavior change.
      'src/lib/types/openapiPaths.d.ts',
      'documentation/commands',
      'dist-gha/',
    ],
  }),
);
