import chalk from 'chalk';
import config from 'config';

import Command from '../../src/cmds/open';
import configStore from '../../src/lib/configstore';

const cmd = new Command();

describe('rdme open', () => {
  afterEach(() => {
    configStore.clear();
  });

  it('should error if no project provided', () => {
    configStore.delete('project');

    return expect(cmd.run({})).rejects.toThrow(`Please login using \`${config.get('cli')} login\`.`);
  });

  it('should open the project', () => {
    expect.assertions(2);
    configStore.set('project', 'subdomain');

    const projectUrl = 'https://subdomain.readme.io';

    function mockOpen(url: string) {
      expect(url).toBe(projectUrl);
      return Promise.resolve();
    }

    return expect(cmd.run({ mockOpen })).resolves.toBe(`Opening ${chalk.green(projectUrl)} in your browser...`);
  });
});
