#!/usr/bin/env node --no-warnings=ExperimentalWarning
// ^ we need this env variable above to hide the ExperimentalWarnings
// source: https://github.com/nodejs/node/issues/10802#issuecomment-573376999

import stringArgv from 'string-argv';

async function main() {
  const { execute } = await import('@oclif/core');
  const args = process.env.INPUT_RDME ? stringArgv(process.env.INPUT_RDME) : [];
  await execute({ args, dir: import.meta.url }).then(msg => {
    if (msg) {
      // eslint-disable-next-line no-console
      console.log(msg);
    }
  });
}

main();
