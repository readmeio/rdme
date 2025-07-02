#!/usr/bin/env npx tsx

async function main() {
  const { execute } = await import('@oclif/core');
  await execute({ development: true, dir: import.meta.url }).then(msg => {
    if (msg && typeof msg === 'string') {
      console.log(msg);
    }
    return process.exit(0);
  });
}

await main();
