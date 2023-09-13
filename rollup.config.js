import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import { defineConfig } from 'rollup';

export default defineConfig({
  input: 'bin/rdme.js',
  output: { file: 'rdme-rollup.cjs', format: 'cjs', inlineDynamicImports: true },
  plugins: [
    commonjs(),
    json(),
    nodeResolve({
      // see here: https://github.com/rollup/plugins/tree/master/packages/node-resolve#exportconditions
      // this is required to get chalk working properly
      exportConditions: ['node'],
      preferBuiltins: true,
    }),
    replace({
      delimiters: ['', ''],
      preventAssignment: true,
      values: {
        'if (typeof module === "object" && typeof module.exports === "object") {':
          'if (typeof module === "object" && typeof module.exports === "object" && typeof module.exports.default === "object") {',
      },
    }),
  ],
});
