import Configstore from 'configstore';

import pkg from '../../package.json';

export default new Configstore(`${pkg.name}-${process.env.NODE_ENV || 'production'}`);
