/* eslint-disable jest/no-conditional-expect */
import assert from 'assert';

import OpenAPIUsesCommand from '../../../src/cmds/openapi/uses';

const analyzer = new OpenAPIUsesCommand();

const testWorkingDir = process.cwd();

describe('rdme openapi:uses', () => {
  afterEach(() => {
    process.chdir(testWorkingDir);
  });

  it('should analyze a given spec and generate a full report', async () => {
    const spec = require.resolve('@readme/oas-examples/3.0/json/petstore.json');

    await expect(
      analyzer.run({
        spec,
      })
    ).resolves.toMatchSnapshot();
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

    it('should generate a report for only readme features', async () => {
      const spec = require.resolve('@readme/oas-examples/3.0/json/readme-extensions.json');

      try {
        await analyzer.run({
          spec,
          feature: ['readme'],
        });

        assert.fail(
          'A soft error should have been thrown for this test case as `x-default` is not used in the example spec.'
        );
      } catch (err) {
        expect(err.name).toBe('SoftError');
        expect(err.message).toMatchSnapshot();
      }
    });

    it('should generate a report for some openapi features', async () => {
      const spec = require.resolve('@readme/oas-examples/3.0/json/schema-circular.json');

      await expect(
        analyzer.run({
          spec,
          feature: ['additionalProperties', 'circularRefs'],
        })
      ).resolves.toMatchSnapshot();
    });

    it('should generate a report with mixed features', async () => {
      const spec = require.resolve('@readme/oas-examples/3.0/json/schema-circular.json');
      try {
        await analyzer.run({
          spec,
          feature: ['additionalProperties', 'circularRefs', 'readme'],
        });

        assert.fail('A soft error should have been thrown for this test case no ReadMe features are used.');
      } catch (err) {
        expect(err.name).toBe('SoftError');
        expect(err.message).toMatchSnapshot();
      }
    });
  });
});
