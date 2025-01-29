#!/usr/bin/env npx tsx

async function main() {
  process.env.RDME_NEW_VERSION_CHECK_TAG = 'release-v9';
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
