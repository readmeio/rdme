import Configstore from 'configstore';
import pkg from './getPackage.js';

export default new Configstore(`${pkg.name}-${process.env.NODE_ENV || 'production'}`);
