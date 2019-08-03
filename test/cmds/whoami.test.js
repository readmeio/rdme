const assert = require('assert');
const config = require('config');
const configStore = require('../../lib/configstore');
const cmd = require('../../cmds/whoami');
const loginCmd = require('../../cmds/login');

describe('whoami command', () => {
  it('should error if user is not authenticate', done => {
    configStore.delete('email');
    configStore.delete('project');

    cmd
      .run({})
      .then(() => {
        assert.ok(false, 'unauthenticated error message not displayed');
      })
      .catch(err => {
        assert.equal(err.message, `Please login using \`${config.cli} ${loginCmd.command}\`.`);
        return done();
      });
  });

  it('should return the authenticated user', done => {
    configStore.set('email', 'email@example.com');
    configStore.set('project', 'subdomain');

    cmd
      .run({})
      .then(() => {
        assert.ok(true);
        return done();
      })
      .catch(err => {
        assert.ok(false, err);
        return done();
      });
  });
});
