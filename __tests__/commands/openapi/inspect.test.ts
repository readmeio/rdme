import { beforeAll, describe, expect, it } from 'vitest';

import Command from '../../../src/commands/openapi/inspect.js';
import { type OclifOutput, runCommand } from '../../helpers/oclif.js';

describe('rdme openapi inspect', () => {
  let run: (args?: string[]) => OclifOutput;

  beforeAll(() => {
    run = runCommand(Command);
  });

  describe('full reports', () => {
    it.each([
      '@readme/oas-examples/3.0/json/petstore.json',
      '@readme/oas-examples/3.0/json/readme-legacy.json',
      '@readme/oas-examples/3.0/json/readme-extensions.json',
      '@readme/oas-examples/3.1/json/train-travel.json',
    ])('should generate a report for %s', async spec => {
      const { result } = await run([require.resolve(spec)]);
      expect(result).toMatchSnapshot();
    });
  });

  describe('feature reports', () => {
    it('should throw an error if an invalid feature is supplied', () => {
      const spec = require.resolve('@readme/oas-examples/3.0/json/readme-extensions.json');
      return expect(run([spec, '--feature', 'style', '--feature', 'reamde'])).resolves.toMatchSnapshot();
    });

    const cases: { feature: string[]; shouldSoftError?: true; spec: string }[] = [
      {
        spec: '@readme/oas-examples/3.0/json/readme-legacy.json',
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
      const { result, error } = await run(args);
      if (!shouldSoftError) {
        expect(result).toMatchSnapshot();
      } else {
        expect(error).toMatchSnapshot();
      }
    });
  });
});
