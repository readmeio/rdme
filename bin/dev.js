#!/usr/bin/env npx tsx

async function main() {
  const { execute } = await import('@oclif/core');
  await execute({ development: true, dir: import.meta.url }).then(msg => {
    if (msg && typeof msg === 'string') {
      // oxlint-disable-next-line no-console -- This is in an executable.
      console.log(msg);
    }
    return process.exit(0);
  });
}

await main();
