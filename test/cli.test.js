require('colors');

const nock = require('nock');
const cli = require('../cli');
const { version } = require('../package.json');
const conf = require('../lib/configstore');
const swaggerCmd = require('../cmds/swagger');

describe('cli', () => {
  it('command not found', () => {
    expect.assertions(1);
    return cli('notARealCommand').catch(e => {
      expect(e.message).toContain('Command not found');
    });
  });

  describe('--version', () => {
    it('should return version from package.json', () =>
      cli(['--version']).then(v => expect(v).toBe(version)));

    it('should return version if the `-V` alias is supplied', () =>
      cli(['-V']).then(v => expect(v).toBe(version)));

    it('should return version from package.json for help command', () =>
      cli(['help', '--version']).then(v => expect(v).toBe(version)));

    // This is necessary because we use --version for other commands like `docs`
    it('should only return version if no command', () => {
      expect.assertions(1);

      return cli(['no-such-command', '--version']).catch(err => {
        // This can be ignored as it's just going to be a command not found error
        expect(err.message).toBe('Command not found.');
      });
    });

    it('should not be returned if `--version` is being used on a subcommand', () => {
      expect.assertions(1);
      nock.disableNetConnect();

      return cli(['docs:edit', 'getting-started', '--version', '1.0.0', '--key=abcdef']).catch(
        e => {
          expect(e.message).not.toBe('No project version provided. Please use `--version`.');
        },
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
        expect(output.indexOf(swaggerCmd.description) !== -1).toBeTruthy();
        expect(output.indexOf(swaggerCmd.usage) !== -1).toBeTruthy();
        expect(output.indexOf('--key') !== -1).toBeTruthy();
        expect(output.indexOf('--help') !== -1).toBeTruthy();
      });
    });

    it('should print usage for a given command if supplied as `help <command>`', () => {
      return cli(['help', 'swagger']).then(output => {
        expect(output.indexOf(swaggerCmd.description) !== -1).toBeTruthy();
        expect(output.indexOf(swaggerCmd.usage) !== -1).toBeTruthy();
        expect(output.indexOf('--key') !== -1).toBeTruthy();
        expect(output.indexOf('--help') !== -1).toBeTruthy();
      });
    });

    it('should not surface args that are designated as hidden', () => {
      return cli(['swagger', '--help']).then(output => {
        expect(output.indexOf('---token') === -1).toBeTruthy();
        expect(output.indexOf('---spec') === -1).toBeTruthy();
      });
    });

    it('should show related commands for a subcommands help menu', () => {
      return cli(['versions', '--help']).then(output => {
        expect(output.indexOf('Related commands') !== -1).toBeTruthy();
        expect(output.indexOf('versions:create') !== -1).toBeTruthy();
      });
    });

    it('should not show related commands on commands that have none', () => {
      return cli(['swagger', '--help']).then(output => {
        expect(output.indexOf('Related commands') === -1).toBeTruthy();
      });
    });
  });

  describe('subcommands', () => {
    // docs:edit will make a backend connection
    beforeAll(() => nock.disableNetConnect());

    it('should load subcommands from the folder', () => {
      expect.assertions(1);
      return cli(['docs:edit', 'getting-started', '--version=1.0.0', '--key=abcdef']).catch(e => {
        expect(e.message).not.toBe('Command not found.');
      });
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
      expect(err.message).toBe('No project version provided. Please use `--version`.');
    });
  });

  it('should not error with oas arguments passed in', () => {
    expect(() => {
      return cli(['oas', 'init']);
    }).not.toThrow();
  });
});
