import Configstore from 'configstore';

import pkg from '../../package.json' with { type: 'json' };

const configstore = new Configstore(
  /**
   * The `VITEST_POOL_ID` and `VITEST_WORKER_ID` are used here to ensure that our `configstore`
   * tests don't clash with one another.
   *
   * @see {@link https://vitest.dev/guide/migration.html#envs}
   */
  `${pkg.name}-${process.env.NODE_ENV || 'production'}${process.env.VITEST_POOL_ID || ''}${
    process.env.VITEST_WORKER_ID || ''
  }`,
);

export default configstore;
