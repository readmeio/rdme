// https://stackoverflow.com/a/65402918
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
export default require('../../package.json');
