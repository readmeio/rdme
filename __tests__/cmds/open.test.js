const chalk = require('chalk');
const config = require('config');
const configStore = require('../../src/lib/configstore');
const Command = require('../../src/cmds/open');

const cmd = new Command();

describe('rdme open', () => {
  it('should error if no project provided', () => {
    configStore.delete('project');

    return expect(cmd.run({})).rejects.toThrow(`Please login using \`${config.get('cli')} login\`.`);
  });

  it('should open the project', () => {
    expect.assertions(2);
    configStore.set('project', 'subdomain');

    const projectUrl = 'https://subdomain.readme.io';

    function mockOpen(url) {
      expect(url).toBe(projectUrl);
      return Promise.resolve();
    }

    return expect(cmd.run({ mockOpen })).resolves.toBe(`Opening ${chalk.green(projectUrl)} in your browser...`);
  });
});
