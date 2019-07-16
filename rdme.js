#! /usr/bin/env node
require('colors');

const program = require('yargs');

const argv = program
  .commandDir('cmds')
  .showHelpOnFail(false, 'Specify --help for available options')
  .strict()
  .fail((msg, err) => {
    if (err) {
      // `err.message` is from locally thrown Error objects
      // `err.error` is from remote API errors
      if (err.message) console.error(err.message.red);

      if (err.error && err.description) {
        console.error(err.description.red);
      } else if (err.description) {
        console.warn(err.description);
      }

      if (err.errors) console.warn(err.errors);
    }

    process.exit(1);
  })
  .parse();

if (!argv._[0]) {
  program.showHelp();
}
