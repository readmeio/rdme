#!/usr/bin/env npx tsx

async function main() {
  const { writeCommandResult } = await import('../src/lib/workflowCommands.js');
  const { execute } = await import('@oclif/core');
  await execute({ development: true, dir: import.meta.url }).then(msg => {
    if (msg && typeof msg === 'string') {
      writeCommandResult(msg);
    }
    return process.exit(0);
  });
}

await main();
