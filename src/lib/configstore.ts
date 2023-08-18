import Configstore from 'configstore';

import pkg from '../../package.json';

const configstore = new Configstore(
  /**
   * The JEST_WORKER_ID is used here to ensure that our
   * configstore tests don't clash with one another
   * @see {@link https://jestjs.io/docs/environment-variables}
   */
  `${pkg.name}-${process.env.NODE_ENV || 'production'}${process.env.JEST_WORKER_ID || ''}`,
);

export default configstore;
