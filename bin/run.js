#!/usr/bin/env node

async function main() {
  const { execute } = await import('@oclif/core');
  await execute({ dir: import.meta.url }).then(msg => {
    if (msg) {
      // eslint-disable-next-line no-console
      console.log(msg);
    }
  });
}

await main();
