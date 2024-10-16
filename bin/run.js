#!/usr/bin/env node --no-warnings=ExperimentalWarning
// ^ we need this env variable above to hide the ExperimentalWarnings
// source: https://github.com/nodejs/node/issues/10802#issuecomment-573376999

async function main() {
  const { execute } = await import('@oclif/core');
  await execute({ dir: import.meta.url }).then(msg => {
    if (msg) {
      // eslint-disable-next-line no-console
      console.log(msg);
    }
  });
}

main();
