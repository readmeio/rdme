import { describe, afterEach, it, expect } from 'vitest';

import Command from '../../src/cmds/whoami';
import config from '../../src/lib/config';
import configStore from '../../src/lib/configstore';

const cmd = new Command();

describe('rdme whoami', () => {
  afterEach(() => {
    configStore.clear();
  });

  it('should error if user is not authenticated', () => {
    configStore.delete('email');
    configStore.delete('project');

    return expect(cmd.run({})).rejects.toStrictEqual(new Error(`Please login using \`${config.cli} login\`.`));
  });

  it('should return the authenticated user', () => {
    configStore.set('email', 'email@example.com');
    configStore.set('project', 'subdomain');

    return expect(cmd.run({})).resolves.toMatchSnapshot();
  });
});
