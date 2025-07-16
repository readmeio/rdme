#!/usr/bin/env npx tsx

async function main() {
  const { execute } = await import('@oclif/core');
  await execute({ development: true, dir: import.meta.url }).then(msg => {
    if (msg && typeof msg === 'string') {
      // biome-ignore lint/suspicious/noConsole: This is in an executable.
      console.log(msg);
    }
    return process.exit(0);
  });
}

// biome-ignore lint/nursery/noFloatingPromises: We use rollup to bundle this file and it doesn't play well with top-level await.
main();
