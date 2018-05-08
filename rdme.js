#! /usr/bin/env node
require('colors');
const parseArgs = require('minimist')(process.argv.slice(2));

require('./cli')(parseArgs._[0], parseArgs._.slice(1), parseArgs)
  .then(() => process.exit())
  .catch(err => {
    if (err) console.error(err.message.red);
    if (err.description) console.warn(err.description);
    return process.exit(1);
  });
