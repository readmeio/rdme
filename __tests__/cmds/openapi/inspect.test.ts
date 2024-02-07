/* eslint-disable vitest/no-conditional-expect */
import assert from 'node:assert';

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import OpenAPIInspectCommand from '../../../src/cmds/openapi/inspect.js';
import { gitDefaultMocks } from '../../helpers/get-git-mock.js';

const analyzer = new OpenAPIInspectCommand();

describe('rdme openapi:inspect', () => {
  beforeEach(() => {
    gitDefaultMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('full reports', () => {
    it.each([
      '@readme/oas-examples/3.0/json/petstore.json',
      '@readme/oas-examples/3.0/json/readme.json',
      '@readme/oas-examples/3.0/json/readme-extensions.json',
    ])('should generate a report for %s', spec => {
      return expect(
        analyzer.run({
          spec: require.resolve(spec),
        }),
      ).resolves.toMatchSnapshot();
    });
  });

  describe('feature reports', () => {
    it('should throw an error if an invalid feature is supplied', () => {
      const spec = require.resolve('@readme/oas-examples/3.0/json/readme-extensions.json');

      return expect(
        analyzer.run({
          spec,
          feature: ['style', 'reamde'],
        }),
      ).rejects.toStrictEqual(new Error('Unknown features: reamde. See `rdme help openapi:inspect` for help.'));
    });

    const cases: { feature: string[]; shouldSoftError?: true; spec: string }[] = [
      {
        spec: '@readme/oas-examples/3.0/json/readme.json',
        feature: ['polymorphism'],
      },
      {
        spec: '@readme/oas-examples/3.0/json/schema-circular.json',
        feature: ['additionalProperties', 'circularRefs'],
      },

      // Soft error cases where we may or may not contain the features we're querying for.
      {
        spec: '@readme/oas-examples/3.0/json/readme-extensions.json',
        feature: ['readme'],
        shouldSoftError: true,
      },
      {
        spec: '@readme/oas-examples/3.0/json/schema-circular.json',
        feature: ['additionalProperties', 'circularRefs', 'readme'],
        shouldSoftError: true,
      },
      {
        spec: '@readme/oas-examples/3.0/json/schema-circular.json',
        feature: ['circularRefs', 'readme'],
        shouldSoftError: true,
      },
    ];

    it.each(cases)('should generate a report for $spec (w/ $feature)', async ({ spec, feature, shouldSoftError }) => {
      if (!shouldSoftError) {
        await expect(
          analyzer.run({
            spec: require.resolve(spec),
            feature,
          }),
        ).resolves.toMatchSnapshot();
        return;
      }

      try {
        await analyzer.run({
          spec: require.resolve(spec),
          feature,
        });

        assert.fail('A soft error should have been thrown for this test case.');
      } catch (err) {
        expect(err.name).toBe('SoftError');
        expect(err.message).toMatchSnapshot();
      }
    });
  });
});
