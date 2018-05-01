#! /usr/bin/env node
const parseArgs = require('minimist')(process.argv.slice(2));

require('./cli')(parseArgs._, parseArgs);
