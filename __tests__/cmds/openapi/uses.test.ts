/* eslint-disable jest/no-conditional-expect */
import assert from 'assert';

import OpenAPIUsesCommand from '../../../src/cmds/openapi/uses';

const analyzer = new OpenAPIUsesCommand();

const testWorkingDir = process.cwd();

describe('rdme openapi:uses', () => {
  afterEach(() => {
    process.chdir(testWorkingDir);
  });

  describe('full reports', () => {
    it.each([
      '@readme/oas-examples/3.0/json/petstore.json',
      '@readme/oas-examples/3.0/json/readme.json',
      '@readme/oas-examples/3.0/json/readme-extensions.json',
    ])('should generate a report for %s', async spec => {
      await expect(
        analyzer.run({
          spec: require.resolve(spec),
        })
      ).resolves.toMatchSnapshot();
    });
  });

  describe('feature reports', () => {
    it('should throw an error if an invalid feature is supplied', async () => {
      const spec = require.resolve('@readme/oas-examples/3.0/json/readme-extensions.json');

      await expect(
        analyzer.run({
          spec,
          feature: ['style', 'reamde'],
        })
      ).rejects.toThrow('Unknown features: reamde. See `rdme help openapi:uses` for help');
    });

    const cases: { spec: string; feature: string[]; shouldSoftError?: true }[] = [
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
          })
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
