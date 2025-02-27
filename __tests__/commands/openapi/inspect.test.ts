/* eslint-disable @vitest/no-conditional-expect */
import assert from 'node:assert';

import { describe, it, expect, beforeAll } from 'vitest';

import Command from '../../../src/commands/openapi/inspect.js';
import { runCommandAndReturnResult } from '../../helpers/oclif.js';

describe('rdme openapi inspect', () => {
  let run: (args?: string[]) => Promise<unknown>;

  beforeAll(() => {
    run = runCommandAndReturnResult(Command);
  });

  describe('full reports', () => {
    it.each([
      '@readme/oas-examples/3.0/json/petstore.json',
      '@readme/oas-examples/3.0/json/readme.json',
      '@readme/oas-examples/3.0/json/readme-extensions.json',
      '@readme/oas-examples/3.1/json/train-travel.json',
    ])('should generate a report for %s', spec => {
      return expect(run([require.resolve(spec)])).resolves.toMatchSnapshot();
    });
  });

  describe('feature reports', () => {
    it('should throw an error if an invalid feature is supplied', () => {
      const spec = require.resolve('@readme/oas-examples/3.0/json/readme-extensions.json');

      return expect(run([spec, '--feature', 'style', '--feature', 'reamde'])).rejects.toThrow(
        'Expected --feature=reamde to be one of:',
      );
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
      {
        spec: '@readme/oas-examples/3.1/json/train-travel.json',
        feature: ['commonParameters'],
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
      const args = [require.resolve(spec)].concat(...feature.map(f => ['--feature', f]));
      if (!shouldSoftError) {
        await expect(run(args)).resolves.toMatchSnapshot();

        return;
      }

      try {
        await run(args);

        assert.fail('A soft error should have been thrown for this test case.');
      } catch (err) {
        expect(err.name).toBe('SoftError');
        expect(err.message).toMatchSnapshot();
      }
    });
  });
});
