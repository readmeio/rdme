const fs = require('fs');
const validate = require('../../src/cmds/validate');

const getCommandOutput = () => {
  return [console.warn.mock.calls.join('\n\n'), console.log.mock.calls.join('\n\n')].filter(Boolean).join('\n\n');
};

describe('rdme validate', () => {
  beforeEach(() => {
    console.log = jest.fn();
    console.warn = jest.fn();
  });

  afterEach(() => {
    console.log.mockRestore();
    console.warn.mockRestore();
  });

  it.each([
    ['Swagger 2.0', 'json', '2.0'],
    ['Swagger 2.0', 'yaml', '2.0'],
    ['OpenAPI 3.0', 'json', '3.0'],
    ['OpenAPI 3.0', 'yaml', '3.0'],
    ['OpenAPI 3.1', 'json', '3.1'],
    ['OpenAPI 3.1', 'yaml', '3.1'],
  ])('should support validating a %s definition (format: %s)', (_, format, specVersion) => {
    return validate
      .run({
        spec: require.resolve(`@readme/oas-examples/${specVersion}/${format}/petstore.${format}`),
      })
      .then(() => {
        expect(console.log).toHaveBeenCalledTimes(1);

        const output = getCommandOutput();
        if (specVersion === '2.0') {
          expect(output).toContain(`petstore.${format} is a valid Swagger API definition!`);
        } else {
          expect(output).toContain(`petstore.${format} is a valid OpenAPI API definition!`);
        }
      });
  });

  it('should discover and upload an API definition if none is provided', () => {
    // Surface our test fixture to the root directory so rdme can autodiscover it. It's easier to do
    // this than mocking out the fs module because mocking the fs module here causes Jest sourcemaps
    // to break.
    fs.copyFileSync(require.resolve('@readme/oas-examples/2.0/json/petstore.json'), './swagger.json');

    return validate.run({}).then(() => {
      expect(console.log).toHaveBeenCalledTimes(2);

      const output = getCommandOutput();
      expect(output).toContain('We found swagger.json and are attempting to validate it.');
      expect(output).toContain('swagger.json is a valid Swagger API definition!');

      fs.unlinkSync('./swagger.json');
    });
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
