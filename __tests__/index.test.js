const nock = require('nock');
const cli = require('../src');
const { version } = require('../package.json');
const conf = require('../src/lib/configstore');

describe('cli', () => {
  it('command not found', async () => {
    await expect(cli('notARealCommand')).rejects.toThrow('Command not found');
  });

  describe('--version', () => {
    it('should return version from package.json', async () => {
      await expect(cli(['--version'])).resolves.toBe(version);
    });

    it('should return version if the `-V` alias is supplied', async () => {
      await expect(cli(['-V'])).resolves.toBe(version);
    });

    it('should return version from package.json for help command', async () => {
      await expect(cli(['help', '--version'])).resolves.toBe(version);
    });

    // This is necessary because we use --version for other commands like `docs`
    it('should only return version if no command', async () => {
      await expect(cli(['no-such-command', '--version'])).rejects.toThrow(
        // This can be ignored as it's just going to be a command not found error
        'Command not found.'
      );
    });

    it('should not be returned if `--version` is being used on a subcommand', async () => {
      nock.disableNetConnect();

      await expect(cli(['docs:edit', 'getting-started', '--version', '1.0.0', '--key=abcdef'])).rejects.not.toThrow(
        // We're testing that the docs:edit command does NOT return an error about `--version` not
        // being here because if it throws that error, then that means that `--version` wasn't
        // passed in as expected.
        'No project version provided. Please use `--version`.'
      );
    });
  });

  describe('--help', () => {
    it('should print help', async () => {
      await expect(cli(['--help'])).resolves.toMatchSnapshot();
    });

    it('should print help for the `-H` alias', async () => {
      await expect(cli(['-H'])).resolves.toMatchSnapshot();
    });

    it('should print usage for a given command', async () => {
      await expect(cli(['swagger', '--help'])).resolves.toMatchSnapshot();
    });

    it('should print usage for a given command if supplied as `help <command>`', async () => {
      await expect(cli(['help', 'swagger'])).resolves.toMatchSnapshot();
    });

    it('should not surface args that are designated as hidden', async () => {
      await expect(cli(['swagger', '--help'])).resolves.toMatchSnapshot();
    });

    it('should show related commands for a subcommands help menu', async () => {
      await expect(cli(['versions', '--help'])).resolves.toMatchSnapshot();
    });
  });

  describe('subcommands', () => {
    // docs:edit will make a backend connection
    beforeAll(() => nock.disableNetConnect());

    it('should load subcommands from the folder', async () => {
      await expect(cli(['docs:edit', 'getting-started', '--version=1.0.0', '--key=abcdef'])).rejects.not.toThrow(
        'Command not found.'
      );
    });
  });

  it('should not error with undefined cmd', async () => {
    await expect(cli([])).resolves.toContain('Upload OpenAPI/Swagger definitions');
  });

  it('should add stored apiKey to opts', async () => {
    expect.assertions(1);
    conf.set('apiKey', '123456');

    await expect(cli(['docs'])).rejects.toThrow('No folder provided. Usage `rdme docs <folder> [options]`.');
    conf.delete('apiKey');
  });

  it('should not error with `rdme oas` arguments passed in', () => {
    expect(() => {
      return cli(['oas', 'endpoint']);
    }).not.toThrow();
  });
});
