const fs = require('fs');
const chalk = require('chalk');
const Command = require('../../src/cmds/validate');

const testWorkingDir = process.cwd();

const validate = new Command();

const getCommandOutput = () => {
  return [console.info.mock.calls.join('\n\n')].filter(Boolean).join('\n\n');
};

describe('rdme validate', () => {
  beforeEach(() => {
    console.info = jest.fn();
  });

  afterEach(() => {
    console.info.mockRestore();

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
    // Surface our test fixture to the root directory so rdme can autodiscover it. It's easier to do
    // this than mocking out the fs module because mocking the fs module here causes Jest sourcemaps
    // to break.
    fs.copyFileSync(require.resolve('@readme/oas-examples/2.0/json/petstore.json'), './swagger.json');

    await expect(validate.run({})).resolves.toBe(chalk.green('swagger.json is a valid Swagger API definition!'));

    expect(console.info).toHaveBeenCalledTimes(1);

    const output = getCommandOutput();
    expect(output).toBe(chalk.yellow('We found swagger.json and are attempting to validate it.'));

    fs.unlinkSync('./swagger.json');
  });

  it('should use specified working directory', async () => {
    await expect(
      validate.run({
        spec: 'petstore.json',
        workingDirectory: './__tests__/__fixtures__/relative-ref-oas',
      })
    ).resolves.toBe(chalk.green('petstore.json is a valid OpenAPI API definition!'));
  });

  describe('error handling', () => {
    it('should throw an error if an invalid OpenAPI 3.0 definition is supplied', () => {
      return expect(validate.run({ spec: './__tests__/__fixtures__/invalid-oas.json' })).rejects.toThrow(
        'Token "Error" does not exist.'
      );
    });

    it('should throw an error if an invalid OpenAPI 3.1 definition is supplied', () => {
      return expect(validate.run({ spec: './__tests__/__fixtures__/invalid-oas-3.1.json' })).rejects.toMatchSnapshot();
    });

    it('should throw an error if an in valid Swagger definition is supplied', () => {
      return expect(validate.run({ spec: './__tests__/__fixtures__/invalid-swagger.json' })).rejects.toMatchSnapshot();
    });
  });
});
