/**
 * This file is used to setup and teardown the global environment for Vitest.
 *
 * This file is referenced in `vitest.config.ts` under the `globalSetup` key.
 *
 * @see {@link https://vitest.dev/config/#setupfiles}
 */
import nock from 'nock';

export function setup(): void {
  nock.disableNetConnect();
}

export function teardown(): void {
  nock.cleanAll();
  nock.enableNetConnect();
}
