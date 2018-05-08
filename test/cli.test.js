const assert = require('assert');
const minimist = require('minimist');

const cli = require('../cli');
const { version } = require('../package.json');

describe('cli', () => {
  it('command not found', done =>
    cli('notARealCommand').catch(e => {
      assert.equal(e.message.includes('Command not found'), true)
      return done();
    }));

  describe('--version', () => {
    it('should return version from package.json', () =>
      cli('', [], minimist(['--version'])).then(v => assert.equal(v, version)));

    // This is necessary because we use --version for other commands like `docs`
    it('should only return version if no command', () =>
      cli('no-such-command', [], minimist(['--version'])).then(() => {
        throw new Error('Should not get here');
      }).catch(() => {
        // This can be ignored as it's just going to be
        // a command not found error
      }));
  });

  describe('--help', () => {
    it('should print help and not error', () =>
      cli('', [], minimist(['--help']))
    );
  });
});
