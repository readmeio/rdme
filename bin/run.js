#!/usr/bin/env -S node --no-warnings=ExperimentalWarning
// ^ we need this env variable above to hide the ExperimentalWarnings
// source: https://github.com/nodejs/node/issues/10802#issuecomment-573376999

import stringArgv from 'string-argv';

async function main() {
  const { execute } = await import('@oclif/core');
  const opts = { dir: import.meta.url };
  if (process.env.INPUT_RDME) {
    opts.args = stringArgv(process.env.INPUT_RDME);
  }
  await execute(opts).then(msg => {
    if (msg && typeof msg === 'string') {
      // eslint-disable-next-line no-console
      console.log(msg);
    }
  });
}

main();
