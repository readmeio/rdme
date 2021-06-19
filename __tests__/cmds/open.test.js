const config = require('config');
const configStore = require('../../lib/configstore');
const cmd = require('../../cmds/open');
const loginCmd = require('../../cmds/login');

describe('rdme open', () => {
  it('should error if no project provided', () => {
    configStore.delete('project');

    return expect(cmd.run({})).rejects.toThrow(`Please login using \`${config.cli} ${loginCmd.command}\`.`);
  });

  it('should open the project', () => {
    expect.assertions(2);
    console.log = jest.fn();
    configStore.set('project', 'subdomain');

    function mockOpen(url) {
      expect(url).toBe('https://subdomain.readme.io');
      return Promise.resolve();
    }

    return cmd.run({ mockOpen }).then(() => {
      expect(console.log).toHaveBeenCalledWith(expect.stringMatching(/opening (.*)subdomain.readme.io/i));

      console.log.mockRestore();
    });
  });
});
