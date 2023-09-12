import { readFile } from 'node:fs/promises';

import Configstore from 'configstore';

const pkg = JSON.parse(await readFile(new URL('../../package.json', import.meta.url), { encoding: 'utf-8' }));

const configstore = new Configstore(
  /**
   * The `VITEST_POOL_ID` and `VITEST_WORKER_ID` are used here to ensure that our `configstore`
   * tests don't clash with one another.
   *
   * @see {@link https://vitest.dev/guide/migration.html#:~:text=Vitest%20counterparts.-,Envs,-Just%20like%20Jest}
   */
  `${pkg.name}-${process.env.NODE_ENV || 'production'}${process.env.VITEST_POOL_ID || ''}${
    process.env.VITEST_WORKER_ID || ''
  }`,
);

export default configstore;
