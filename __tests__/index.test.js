require('colors');

const nock = require('nock');
const cli = require('../src');
const { version } = require('../package.json');
const conf = require('../src/lib/configstore');
const swaggerCmd = require('../src/cmds/swagger');

describe('cli', () => {
  it('command not found', () => {
    expect.assertions(1);
    return cli('notARealCommand').catch(e => {
      expect(e.message).toContain('Command not found');
    });
  });

  describe('--version', () => {
    it('should return version from package.json', () => cli(['--version']).then(v => expect(v).toBe(version)));

    it('should return version if the `-V` alias is supplied', () => cli(['-V']).then(v => expect(v).toBe(version)));

    it('should return version from package.json for help command', () =>
      cli(['help', '--version']).then(v => expect(v).toBe(version)));

    // This is necessary because we use --version for other commands like `docs`
    it('should only return version if no command', () => {
      expect.assertions(1);

      return expect(cli(['no-such-command', '--version'])).rejects.toThrow(
        // This can be ignored as it's just going to be a command not found error
        'Command not found.'
      );
    });

    it('should not be returned if `--version` is being used on a subcommand', () => {
      expect.assertions(1);
      nock.disableNetConnect();

      return expect(cli(['docs:edit', 'getting-started', '--version', '1.0.0', '--key=abcdef'])).rejects.not.toThrow(
        // We're testing that the docs:edit command does NOT return an error about `--version` not
        // being here because if it throws that error, then that means that `--version` wasn't
        // passed in as expected.
        'No project version provided. Please use `--version`.'
      );
    });
  });

  describe('--help', () => {
    it('should print help', () =>
      cli(['--help']).then(output => {
        expect(output).not.toBe(version);
      }));

    it('should print help for the `-H` alias', () =>
      cli(['-H']).then(output => {
        expect(output).not.toBe(version);
      }));

    it('should print usage for a given command', () => {
      return cli(['swagger', '--help']).then(output => {
        expect(output).toContain(swaggerCmd.description);
        expect(output).toContain(swaggerCmd.usage);
        expect(output).toContain('--key');
        expect(output).toContain('--help');
      });
    });

    it('should print usage for a given command if supplied as `help <command>`', () => {
      return cli(['help', 'swagger']).then(output => {
        expect(output).toContain(swaggerCmd.description);
        expect(output).toContain(swaggerCmd.usage);
        expect(output).toContain('--key');
        expect(output).toContain('--help');
      });
    });

    it('should not surface args that are designated as hidden', () => {
      return cli(['swagger', '--help']).then(output => {
        expect(output).not.toContain('---token');
        expect(output).not.toContain('---spec');
      });
    });

    it('should show related commands for a subcommands help menu', () => {
      return cli(['versions', '--help']).then(output => {
        expect(output).toContain('Related commands');
        expect(output).toContain('versions:create');
      });
    });

    it.todo('should not show related commands on commands that have none');
  });

  describe('subcommands', () => {
    // docs:edit will make a backend connection
    beforeAll(() => nock.disableNetConnect());

    it('should load subcommands from the folder', () => {
      expect.assertions(1);
      return expect(cli(['docs:edit', 'getting-started', '--version=1.0.0', '--key=abcdef'])).rejects.not.toThrow(
        'Command not found.'
      );
    });
  });

  it('should not error with undefined cmd', () => {
    return cli([]).then(resp => {
      expect(resp).toContain('Available commands');
    });
  });

  it('should add stored apiKey to opts', () => {
    expect.assertions(1);
    conf.set('apiKey', '123456');
    return cli(['docs']).catch(err => {
      conf.delete('apiKey');
      expect(err.message).toBe('No folder provided. Usage `rdme docs <folder> [options]`.');
    });
  });

  it('should not error with oas arguments passed in', () => {
    expect(() => {
      return cli(['oas', 'endpoint']);
    }).not.toThrow();
  });
});
