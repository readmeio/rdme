import type { baseVersionFlags } from './flags.js';

/**
 * All the boolean flags from the `versions:create` and `versions:update` commands
 */
type VersionBooleanOpts = Exclude<keyof typeof baseVersionFlags, 'codename'>;

/**
 * Takes a CLI flag that is expected to be a 'true' or 'false' string
 * and casts it to a boolean.
 */
export default function castStringOptToBool(opt: 'true' | 'false' | undefined, optName: VersionBooleanOpts) {
  if (!opt) {
    return undefined;
  }
  if (opt === 'true') {
    return true;
  }
  if (opt === 'false') {
    return false;
  }
  throw new Error(`Invalid option passed for '${optName}'. Must be 'true' or 'false'.`);
}
