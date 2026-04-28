// @ts-check
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import { defineConfig } from 'rollup';
import { minify } from 'rollup-plugin-esbuild';

const basePlugins = [
  commonjs({ ignoreDynamicRequires: true }),
  json(),
  nodeResolve({
    // see here: https://github.com/rollup/plugins/tree/master/packages/node-resolve#exportconditions
    // this is required to get chalk working properly
    exportConditions: ['node'],
    preferBuiltins: true,
  }),
  minify(),
];

export default defineConfig([
  {
    input: 'bin/run.js',
    output: { file: 'dist-gha/run.cjs', format: 'cjs', inlineDynamicImports: true },
    plugins: basePlugins,
  },
  {
    input: 'dist/index.js',
    output: {
      // We're exporting as CommonJS so Rollup can emit `require()` where dependencies still use
      // it (e.g. `@oclif/core`, `@nodable/entities`) because an ESM bundle alongside `type: module`
      // in `dist-gha/package.json` leaves bare `require()` calls that crash at  runtime.
      file: 'dist-gha/commands.cjs',
      format: 'cjs',
      inlineDynamicImports: true,
    },
    plugins: [
      ...basePlugins,
      // this disgusting workaround is required to prevent runtime errors,
      // see https://github.com/JS-DevTools/ono/issues/19
      replace({
        delimiters: ['', ''],
        preventAssignment: true,
        values: {
          'if (typeof module === "object" && typeof module.exports === "object") {':
            'if (typeof module === "object" && typeof module.exports === "object" && typeof module.exports.default === "object") {',
        },
      }),
    ],
  },
]);
