#!/usr/bin/env node

import stringArgv from 'string-argv';

async function main() {
  /**
   * Disables the oclif engine warning. For some reason the versions that are flagged are totally separate from our engines requirements.
   *
   * @see {@link https://github.com/oclif/core/blob/70d3f192862a5adb548cbda68c6ee1ca8f724110/src/index.ts#L12}
   */
  process.env.OCLIF_DISABLE_ENGINE_WARNING = 'true';

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
