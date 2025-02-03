#!/usr/bin/env node

import stringArgv from 'string-argv';

async function main() {
  /**
   * This is a v9-specific change to ensure that we're pointing to the
   * correct npm release channel for version upgrade checks.
   * Once we deprecate v9, we can remove this line.
   *
   * @see {@link https://github.com/oclif/plugin-warn-if-update-available/blob/75634b0cdb6a605b9ecb503576461e60ba9a37b1/README.md?plain=1#L136}
   */
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
