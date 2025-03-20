#!/usr/bin/env node

import stringArgv from 'string-argv';

// eslint-disable-next-line import/extensions
import setupUndici from '../dist/lib/setup-undici.js';

async function main() {
  await setupUndici();
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
