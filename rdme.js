#! /usr/bin/env node
require('colors');

const parseArgs = require('minimist')(process.argv.slice(2), {
  string: 'version',
  alias: {
    // Allows --version, -v, -V
    v: 'version',
    V: 'version',

    // // Allows --help, -h, -H
    h: 'help',
    H: 'help',
  },
});

console.log(parseArgs);
require('./cli')(parseArgs._[0] || 'help', parseArgs._.slice(1), parseArgs)
  .then(msg => {
    if (msg) console.log(msg);
    process.exit();
  })
  .catch(err => {
    if (err) {
      // `err.message` is from locally thrown Error objects
      // `err.error` is from remote API errors
      if (err.message) console.error(err.message.red);
      if (err.description) console.warn(err.description);
      if (err.errors) console.warn(err.errors);
    }

    return process.exit(1);
  });
