const config = require('config');
const configStore = require('../../src/lib/configstore');
const cmd = require('../../src/cmds/whoami');
const loginCmd = require('../../src/cmds/login');

describe('rdme whoami', () => {
  it('should error if user is not authenticated', () => {
    configStore.delete('email');
    configStore.delete('project');

    return cmd
      .run({})
      .then(() => {
        throw new Error('unauthenticated error message not displayed');
      })
      .catch(err => {
        expect(err.message).toBe(`Please login using \`${config.cli} ${loginCmd.command}\`.`);
      });
  });

  it('should return the authenticated user', () => {
    configStore.set('email', 'email@example.com');
    configStore.set('project', 'subdomain');

    return cmd
      .run({})
      .then(() => {
        expect(true).toBe(true);
      })
      .catch(err => {
        throw new Error(err);
      });
  });
});
