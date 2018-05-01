#! /usr/bin/env node
const parseArgs = require('minimist')(process.argv.slice(2));

require('./api').api(parseArgs._, parseArgs);
