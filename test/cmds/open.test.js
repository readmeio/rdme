const config = require('config');
const configStore = require('../../lib/configstore');
const cmd = require('../../cmds/open');
const loginCmd = require('../../cmds/login');

describe('rdme open', () => {
  it('should error if no project provided', () => {
    expect.assertions(1);
    configStore.delete('project');

    return cmd.run({}).catch(err => {
      expect(err.message).toBe(`Please login using \`${config.cli} ${loginCmd.command}\`.`);
    });
  });

  it('should open the project', () => {
    expect.assertions(1);
    configStore.set('project', 'subdomain');

    function mockOpen(url) {
      expect(url).toBe('https://subdomain.readme.io');
      return Promise.resolve();
    }

    return cmd.run({ mockOpen });
  });
});
