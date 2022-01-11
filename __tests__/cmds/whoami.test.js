const config = require('config');
const configStore = require('../../src/lib/configstore');
const cmd = require('../../src/cmds/whoami');
const loginCmd = require('../../src/cmds/login');

describe('rdme whoami', () => {
  it('should error if user is not authenticated', () => {
    configStore.delete('email');
    configStore.delete('project');

    return expect(cmd.run({})).rejects.toStrictEqual(
      new Error(`Please login using \`${config.get('cli')} ${loginCmd.command}\`.`)
    );
  });

  it('should return the authenticated user', () => {
    configStore.set('email', 'email@example.com');
    configStore.set('project', 'subdomain');

    return expect(cmd.run({})).resolves.toMatchSnapshot();
  });
});
