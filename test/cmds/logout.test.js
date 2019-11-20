const config = require('config');
const configStore = require('../../lib/configstore');
const cmd = require('../../cmds/logout');
const loginCmd = require('../../cmds/login');

describe('rdme logout', () => {
  it("should report the user as logged out if they aren't logged in", () => {
    configStore.delete('email');
    configStore.delete('project');

    return cmd.run({}).then(msg => {
      expect(msg).toBe(
        `You have logged out of Readme. Please use \`${config.cli} ${loginCmd.command}\` to login again.`,
      );
    });
  });

  it('should log the user out', () => {
    configStore.set('email', 'email@example.com');
    configStore.set('project', 'subdomain');

    return cmd.run({}).then(() => {
      expect(configStore.get('email')).toBeUndefined();
      expect(configStore.get('project')).toBeUndefined();
    });
  });
});
