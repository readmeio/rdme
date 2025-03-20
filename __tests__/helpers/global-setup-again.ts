/**
 * This file is used to setup and teardown the global environment for Vitest.
 *
 * This file is referenced in `vitest.config.ts` under the `globalSetup` key.
 *
 * @see {@link https://vitest.dev/config/#setupfiles}
 */

// import setupUndici from '../../src/lib/setup-undici.js';

export async function setup() {
  // await setupUndici({
  //   keepAliveTimeout: 10, // milliseconds
  //   keepAliveMaxTimeout: 10, // milliseconds
  // });
}
