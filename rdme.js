#! /usr/bin/env node
require('colors');

require('./cli')(process.argv.slice(2))
  .then(msg => {
    if (msg) console.log(msg);
    process.exit(0);
  })
  .catch(e => {
    if (e) {
      const err = e;

      if ('message' in err) {
        console.error(err.message.red);
      } else {
        console.error(
          `Yikes, something went wrong! Please try again and if the problem persists, get in touch with our support team at ${
            `support@readme.io`.underline
          }.\n`.red
        );
      }
    }

    return process.exit(1);
  });
