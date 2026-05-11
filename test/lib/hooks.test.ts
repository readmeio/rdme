// oxlint-disable import/first, vitest/prefer-import-in-mock
import type { Hook } from '@oclif/core';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { mockConfigstore, resetMockConfigstore } = vi.hoisted(() => {
  const data = new Map<string, unknown>();
  const api = {
    path: '/mock/rdme-hooks-test-configstore.json',
    get: (key: string) => data.get(key),
    set: (key: string, value: unknown) => {
      data.set(key, value);
    },
    clear: () => {
      data.clear();
    },
  };

  return {
    mockConfigstore: api,
    resetMockConfigstore: () => data.clear(),
  };
});

vi.mock('../../src/lib/configstore.js', () => ({
  default: mockConfigstore,
}));

vi.mock('../../src/lib/loginFlow.js', () => ({
  default: vi.fn(),
}));

import configstore from '../../src/lib/configstore.js';
import prerun from '../../src/lib/hooks/prerun.js';
import loginFlow from '../../src/lib/loginFlow.js';

// `oclif` doesn't make their types for flags portable enough for these tests so we need to rebuild
// them.
interface KeyFlagShape {
  default?: (...args: unknown[]) => Promise<string | undefined>;
  parse?: (input: string | undefined, ...args: unknown[]) => Promise<string>;
}

async function getKeyFlagAfterPrerun(mockContext: Hook.Context, options: { Command: { flags: { key: unknown } } }) {
  await prerun.call(mockContext, options as never);
  return options.Command.flags.key as KeyFlagShape;
}

describe('hooks', () => {
  describe('prerun', () => {
    describe('--key flag', () => {
      let mockContext: Hook.Context;
      let options: { Command: { flags: { key: unknown } } };

      beforeEach(() => {
        resetMockConfigstore();
        delete process.env.TEST_RDME_CI;
        delete process.env.RDME_API_KEY;
        delete process.env.README_API_KEY;
        vi.mocked(loginFlow).mockReset();

        mockContext = {
          debug: vi.fn(),
        } as unknown as Hook.Context;

        options = {
          Command: {
            flags: {
              key: {},
            },
          },
        };
      });

      afterEach(() => {
        vi.restoreAllMocks();
      });

      it('should error if in CI and no key is provided', async () => {
        process.env.TEST_RDME_CI = '1';

        const keyFlag = await getKeyFlagAfterPrerun(mockContext, options);

        await expect(keyFlag.default?.call(mockContext)).rejects.toThrow(
          'No project API key was provided. Please provide one with `--key` or the `RDME_API_KEY` or `README_API_KEY` environment variables.',
        );
      });

      it('should properly prompt for login if not in CI', async () => {
        vi.mocked(loginFlow).mockImplementation(function (this: Hook.Context) {
          configstore.set('apiKey', 'login-flow-key');
          return Promise.resolve('Logged in successfully.');
        });

        const keyFlag = await getKeyFlagAfterPrerun(mockContext, options);
        const apiKey = await keyFlag.default?.call(mockContext);

        expect(loginFlow).toHaveBeenCalledTimes(1);
        expect(apiKey).toBe('login-flow-key');
      });

      it('should properly pass key flag', async () => {
        const keyFlag = await getKeyFlagAfterPrerun(mockContext, options);

        await expect(keyFlag.parse?.call(mockContext, '')).rejects.toThrow('No project API key was specified.');
        await expect(keyFlag.parse?.call(mockContext, '   ')).rejects.toThrow('No project API key was specified.');

        await expect(keyFlag.parse?.call(mockContext, '  my-api-key  ')).resolves.toBe('my-api-key');
      });

      it.each([
        ['RDME_API_KEY', 'env-from-rdme'],
        ['README_API_KEY', 'env-from-readme'],
      ] as const)('should properly pass API key from `%s` when resolving default', async (envVar, expectedKey) => {
        process.env[envVar] = expectedKey;

        const keyFlag = await getKeyFlagAfterPrerun(mockContext, options);

        await expect(keyFlag.default?.call(mockContext)).resolves.toBe(expectedKey);
      });

      it('should properly pass configstore key', async () => {
        configstore.set('apiKey', '  stored-key  ');

        const keyFlag = await getKeyFlagAfterPrerun(mockContext, options);

        await expect(keyFlag.default?.call(mockContext)).resolves.toBe('stored-key');
      });

      it('should log to debug when default resolves an existing API key from env or store (no login)', async () => {
        process.env.RDME_API_KEY = 'prefetched';

        const keyFlag = await getKeyFlagAfterPrerun(mockContext, options);

        await keyFlag.default?.call(mockContext);

        expect(mockContext.debug).toHaveBeenCalledWith('api key found in config, returning');
      });
    });
  });
});
