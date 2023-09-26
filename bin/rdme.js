#!/usr/bin/env NODE_OPTIONS=--no-warnings node
// ^ we need this env variable above to hide the ExperimentalWarnings
// source: https://github.com/nodejs/node/issues/10802#issuecomment-573376999
// eslint-disable-next-line import/extensions
import '../dist/src/cli.js';
