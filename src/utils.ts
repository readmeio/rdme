import BaseCommand from './lib/baseCommand.js';
import readdirRecursive from './lib/readdirRecursive.js';

export { BaseCommand };

export { handleAPIv2Res, readmeAPIv2Fetch } from './lib/readmeAPIFetch.js';
export { readdirRecursive };

/**
 * Type guard to check that a given value is a record.
 *
 */
export function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}
