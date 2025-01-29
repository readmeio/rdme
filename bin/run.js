#!/usr/bin/env node

import stringArgv from 'string-argv';

async function main() {
  process.env.RDME_NEW_VERSION_CHECK_TAG = 'release-v9';
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
