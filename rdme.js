#! /usr/bin/env node
require('colors');

require('./cli')(process.argv.slice(2))
  .then(msg => {
    if (msg) console.log(msg);
    process.exit(0);
  })
  .catch(err => {
    if (err) {
      // `err.message` is from locally thrown Error objects
      // `err.error` is from remote API errors
      if (!err.description && !err.errors && err.error) {
        console.error(`Yikes, something went wrong! Please try again and if the problem persists, get in touch with our support team at ${`support@readme.io`.underline}.\n`.red)
      }

      if (err.message) console.error(err.message.red);
      if (err.description) console.error(err.description.red);
      if (err.errors) {
        const errors = Object.keys(err.errors);

        console.error(`\nCause${errors.length > 1 && 's' || ''}:`.red.bold)
        errors.forEach((e) => {
          console.error(` · ${e}: ${err.errors[e]}`.red)
        });
      }
    }

    return process.exit(1);
  });
