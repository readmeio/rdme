const assert = require('assert');
const config = require('config');
const configStore = require('../../lib/configstore');
const cmd = require('../../cmds/logout');
const loginCmd = require('../../cmds/login');

describe('rdme logout', () => {
  it('should error if user is not authenticated', done => {
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
