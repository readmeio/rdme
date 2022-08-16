/* eslint-disable no-console */
import fs from 'fs';

import chalk from 'chalk';
import prompts from 'prompts';

import Command from '../../src/cmds/validate';

const testWorkingDir = process.cwd();

const validate = new Command();

let consoleSpy;

const getCommandOutput = () => {
  return [consoleSpy.mock.calls.join('\n\n')].filter(Boolean).join('\n\n');
};

describe('rdme validate', () => {
  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'info').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();

    process.chdir(testWorkingDir);
  });

  it.each([
    ['Swagger 2.0', 'json', '2.0'],
    ['Swagger 2.0', 'yaml', '2.0'],
    ['OpenAPI 3.0', 'json', '3.0'],
    ['OpenAPI 3.0', 'yaml', '3.0'],
    ['OpenAPI 3.1', 'json', '3.1'],
    ['OpenAPI 3.1', 'yaml', '3.1'],
  ])('should support validating a %s definition (format: %s)', (_, format, specVersion) => {
    expect(console.info).toHaveBeenCalledTimes(0);
    return expect(
      validate.run({
        spec: require.resolve(`@readme/oas-examples/${specVersion}/${format}/petstore.${format}`),
      })
    ).resolves.toContain(
      `petstore.${format} is a valid ${specVersion === '2.0' ? 'Swagger' : 'OpenAPI'} API definition!`
    );
  });

  it('should discover and upload an API definition if none is provided', async () => {
    await expect(validate.run({ workingDirectory: './__tests__/__fixtures__/relative-ref-oas' })).resolves.toBe(
      chalk.green('petstore.json is a valid OpenAPI API definition!')
    );

    expect(console.info).toHaveBeenCalledTimes(1);

    const output = getCommandOutput();
    expect(output).toBe(chalk.yellow('ℹ️  We found petstore.json and are attempting to validate it.'));
  });

  it('should select spec in prompt and validate it', async () => {
    const spec = '__tests__/__fixtures__/petstore-simple-weird-version.json';
    prompts.inject([spec]);
    await expect(validate.run({})).resolves.toBe(chalk.green(`${spec} is a valid OpenAPI API definition!`));
  });

  it('should use specified working directory', () => {
    return expect(
      validate.run({
        spec: 'petstore.json',
        workingDirectory: './__tests__/__fixtures__/relative-ref-oas',
      })
    ).resolves.toBe(chalk.green('petstore.json is a valid OpenAPI API definition!'));
  });

  it('should adhere to .gitignore in subdirectories', () => {
    fs.copyFileSync(
      require.resolve('@readme/oas-examples/3.0/json/petstore-simple.json'),
      './__tests__/__fixtures__/nested-gitignored-oas/nest/petstore-ignored.json'
    );

    return expect(
      validate.run({
        workingDirectory: './__tests__/__fixtures__/nested-gitignored-oas',
      })
    ).resolves.toBe(chalk.green('nest/petstore.json is a valid OpenAPI API definition!'));
  });

  describe('error handling', () => {
    it('should throw an error if invalid JSON is supplied', () => {
      return expect(validate.run({ spec: './__tests__/__fixtures__/invalid-json/yikes.json' })).rejects.toStrictEqual(
        new SyntaxError('Unexpected end of JSON input')
      );
    });

    it('should throw an error if an invalid OpenAPI 3.0 definition is supplied', () => {
      return expect(validate.run({ spec: './__tests__/__fixtures__/invalid-oas.json' })).rejects.toThrow(
        'Token "Error" does not exist.'
      );
    });

    it('should throw an error if an invalid OpenAPI 3.1 definition is supplied', () => {
      return expect(validate.run({ spec: './__tests__/__fixtures__/invalid-oas-3.1.json' })).rejects.toMatchSnapshot();
    });

    it('should throw an error if an invalid Swagger definition is supplied', () => {
      return expect(validate.run({ spec: './__tests__/__fixtures__/invalid-swagger.json' })).rejects.toMatchSnapshot();
    });
  });
});
