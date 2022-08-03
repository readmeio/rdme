import config from 'config';
import configStore from '../../src/lib/configstore.js';
import Command from '../../src/cmds/whoami.js';

const cmd = new Command();

describe('rdme whoami', () => {
  it('should error if user is not authenticated', () => {
    configStore.delete('email');
    configStore.delete('project');

    return expect(cmd.run({})).rejects.toStrictEqual(new Error(`Please login using \`${config.get('cli')} login\`.`));
  });

  it('should return the authenticated user', () => {
    configStore.set('email', 'email@example.com');
    configStore.set('project', 'subdomain');

    return expect(cmd.run({})).resolves.toMatchSnapshot();
  });
});
