#! /usr/bin/env node
require('colors');

require('./cli')()
  .then(msg => {
    if (msg) console.log(msg);
    process.exit(0);
  })
  .catch(err => {
    if (err) {
      // `err.message` is from locally thrown Error objects
      // `err.error` is from remote API errors
      if (err.message) console.error(err.message.red);
      if (err.description) console.warn(err.description);
      if (err.errors) console.warn(err.errors);

      if (!err.description && !err.errors && err.error) {
        console.error(`Yikes, something went wrong!\n\nPlease try again and if the problem persists, get in touch with our support team at ${`support@readme.io`.underline}.`.red)
      }
    }

    return process.exit(1);
  });
