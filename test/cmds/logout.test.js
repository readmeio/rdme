const assert = require('assert');
const config = require('config');
const configStore = require('../../lib/configstore');
const cmd = require('../../cmds/logout');
const loginCmd = require('../../cmds/login');

describe('rdme logout', () => {
  it("should report the user as logged out if they aren't logged in", done => {
    configStore.delete('email');
    configStore.delete('project');

    cmd
      .run({})
      .then(msg => {
        assert.equal(
          msg,
          `You have logged out of Readme. Please use \`${config.cli} ${loginCmd.command}\` to login again.`,
        );
        return done();
      })
      .catch(err => {
        assert.ok(false, err);
        return done();
      });
  });

  it('should log the user out', done => {
    configStore.set('email', 'email@example.com');
    configStore.set('project', 'subdomain');

    cmd
      .run({})
      .then(() => {
        assert.equal(configStore.get('email'), undefined, 'config was not destroyed');
        assert.equal(configStore.get('project'), undefined, 'config was not destroyed');
        return done();
      })
      .catch(err => {
        assert.ok(false, err);
        return done();
      });
  });
});
