#!/usr/bin/env node

import stringArgv from 'string-argv';

async function main() {
  const { execute } = await import('@oclif/core');
  const opts = { dir: import.meta.url };
  if (process.env.INPUT_RDME) {
    opts.args = stringArgv(process.env.INPUT_RDME);
  }
  await execute(opts).then(msg => {
    if (msg && typeof msg === 'string') {
      // biome-ignore lint/suspicious/noConsole: This is in an executable.
      console.log(msg);
    }
  });
}

// biome-ignore lint/nursery/noFloatingPromises: We use rollup to bundle this file and it doesn't play well with top-level await.
main();
