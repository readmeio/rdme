require('colors');

const assert = require('assert');
const nock = require('nock');
const cli = require('../cli');
const { version } = require('../package.json');
const conf = require('../lib/configstore');
const swaggerCmd = require('../cmds/swagger');

describe('cli', () => {
  it('command not found', done =>
    cli('notARealCommand').catch(e => {
      assert.equal(e.message.includes('Command not found'), true);
      return done();
    }));

  describe('--version', () => {
    it('should return version from package.json', () =>
      cli(['--version']).then(v => assert.equal(v, version)));

    it('should return version if the `-V` alias is supplied', () =>
      cli(['-V']).then(v => assert.equal(v, version)));

    it('should return version from package.json for help command', () =>
      cli(['help', '--version']).then(v => assert.equal(v, version)));

    // This is necessary because we use --version for other commands like `docs`
    it('should only return version if no command', () =>
      cli(['no-such-command', '--version'])
        .then(() => {
          throw new Error('Should not get here');
        })
        .catch(() => {
          // This can be ignored as it's just going to be
          // a command not found error
        }));

    it('should not be returned if `--version` is being used on a subcommand', () => {
      nock.disableNetConnect();

      cli(['docs:edit', 'getting-started', '--version', '1.0.0', '--key=abcdef']).catch(e => {
        assert.notEqual(e.message, 'No project version provided. Please use `--version`.');
      });
    });
  });

  describe('--help', () => {
    it('should print help', () =>
      cli(['--help']).then(output => {
        assert.notEqual(output, version);
      }));

    it('should print help for the `-H` alias', () =>
      cli(['-H']).then(output => {
        assert.notEqual(output, version);
      }));

    it('should print usage for a given command', () => {
      cli(['swagger', '--help']).then(output => {
        assert.ok(output.indexOf(swaggerCmd.description) !== -1);
        assert.ok(output.indexOf(swaggerCmd.usage) !== -1);
        assert.ok(output.indexOf('--key') !== -1);
        assert.ok(output.indexOf('--help') !== -1);
      });
    });

    it('should print usage for a given command if supplied as `help <command>`', () => {
      cli(['help', 'swagger']).then(output => {
        assert.ok(output.indexOf(swaggerCmd.description) !== -1);
        assert.ok(output.indexOf(swaggerCmd.usage) !== -1);
        assert.ok(output.indexOf('--key') !== -1);
        assert.ok(output.indexOf('--help') !== -1);
      });
    });

    it('should not surface args that are designated as hidden', () => {
      cli(['swagger', '--help']).then(output => {
        assert.ok(output.indexOf('---token') === -1);
        assert.ok(output.indexOf('---spec') === -1);
      });
    });

    it('should show related commands for a subcommands help menu', () => {
      cli(['versions', '--help']).then(output => {
        assert.ok(output.indexOf('Related commands') !== -1);
        assert.ok(output.indexOf('versions:create') !== -1);
      });
    });

    it('should not show related commands on commands that have none', () => {
      cli(['swagger', '--help']).then(output => {
        assert.ok(output.indexOf('Related commands') === -1);
      });
    });
  });

  describe('subcommands', () => {
    // docs:edit will make a backend connection
    beforeAll(() => nock.disableNetConnect());

    it('should load subcommands from the folder', () =>
      cli(['docs:edit', 'getting-started', '--version=1.0.0', '--key=abcdef']).catch(e => {
        assert.notEqual(e.message, 'Command not found.');
      }));
  });

  it('should not error with undefined cmd', () =>
    cli([]).catch(() => {
      // This can be ignored as it's just going to be
      // a command not found error
    }));

  it('should add stored apiKey to opts', () => {
    conf.set('apiKey', '123456');
    return cli(['docs']).catch(err => {
      conf.delete('apiKey');
      assert.equal(err.message, 'No project version provided. Please use `--version`.');
    });
  });

  it('should not error with oas arguments passed in', () => {
    assert.doesNotThrow(() => {
      cli(['oas', 'init']);
    });
  });
});
