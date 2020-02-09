#! /usr/bin/env node
require('colors');

require('./cli')(process.argv.slice(2))
  .then(msg => {
    if (msg) console.log(msg);
    process.exit(0);
  })
  .catch(e => {
    if (e) {
      // `err.message` is from locally thrown Error objects
      // `err.error` is from remote API errors
      const err = e;

      // If we've got a remote API error, extract its contents so we can show the user the error.
      if (typeof err.error === 'object' && Object.keys(err.error).length === 3) {
        err.message = err.error.error;
        err.description = err.error.description;
        err.errors = err.error.errors;
      }

      if (!err.description && !err.errors && err.error) {
        console.error(
          `Yikes, something went wrong! Please try again and if the problem persists, get in touch with our support team at ${
            `support@readme.io`.underline
          }.\n`.red
        );
      }

      if (err.message && (typeof err.statusCode === 'undefined' || err.statusCode !== 404))
        console.error(err.message.red);

      if (err.description) console.error(err.description.red);
      if (err.errors) {
        const errors = Object.keys(err.errors);

        console.error(`\nCause${(errors.length > 1 && 's') || ''}:`.red.bold);
        errors.forEach(error => {
          console.error(` · ${error}: ${err.errors[error]}`.red);
        });
      }
    }

    return process.exit(1);
  });
