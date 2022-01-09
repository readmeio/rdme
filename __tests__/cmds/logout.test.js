const config = require('config');
const configStore = require('../../src/lib/configstore');
const Command = require('../../src/cmds/logout');

const cmd = new Command();

describe('rdme logout', () => {
  it("should report the user as logged out if they aren't logged in", () => {
    configStore.delete('email');
    configStore.delete('project');

    return cmd.run({}).then(msg => {
      expect(msg).toBe(`You have logged out of ReadMe. Please use \`${config.get('cli')} login\` to login again.`);
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
