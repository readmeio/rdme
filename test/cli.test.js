const assert = require('assert');
const minimist = require('minimist');
const nock = require('nock');

const cli = require('../cli');
const { version } = require('../package.json');
const conf = require('../utils/configstore');

describe('cli', () => {
  it('command not found', done =>
    cli('notARealCommand').catch(e => {
      assert.equal(e.message.includes('Command not found'), true);
      return done();
    }));

  describe('--version', () => {
    it('should return version from package.json', () =>
      cli('', [], minimist(['--version'])).then(v => assert.equal(v, version)));

    it('should return version from package.json for help command', () =>
      cli('help', [], minimist(['--version'])).then(v => assert.equal(v, version)));

    // This is necessary because we use --version for other commands like `docs`
    it('should only return version if no command', () =>
      cli('no-such-command', [], minimist(['--version']))
        .then(() => {
          throw new Error('Should not get here');
        })
        .catch(() => {
          // This can be ignored as it's just going to be
          // a command not found error
        }));
  });

  describe('--help', () => {
    it('should print help and not version', () =>
      cli('help', [], minimist(['--help'])).then(output => {
        assert.notEqual(output, version);
      }));
  });

  describe('subcommands', () => {
    // docs:edit will make a backend connection
    beforeAll(() => nock.disableNetConnect());

    it('should load subcommands from the folder', () =>
      cli('docs:edit', ['getting-started'], minimist(['--version=1.0.0', '--key=abcdef'])).catch(
        e => {
          assert.notEqual(e.message, 'Command not found.');
        },
      ));
  });

  it('should not error with undefined cmd', () =>
    cli(undefined, []).catch(() => {
      // This can be ignored as it's just going to be
      // a command not found error
    }));

  it('should add stored apiKey to opts', () => {
    conf.set('apiKey', '123456');
    return cli('docs', [], {}).catch(err => {
      conf.delete('apiKey');
      assert.equal(err.message, 'No version provided. Please use --version');
    });
  });
});
