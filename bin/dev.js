#!/usr/bin/env npx tsx

import setupUndici from '../src/lib/setup-undici.js';

async function main() {
  await setupUndici();
  const { execute } = await import('@oclif/core');
  await execute({ development: true, dir: import.meta.url }).then(msg => {
    if (msg && typeof msg === 'string') {
      // eslint-disable-next-line no-console
      console.log(msg);
    }
    return process.exit(0);
  });
}

await main();
