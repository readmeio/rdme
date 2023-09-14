import { describe, afterEach, it, expect } from 'vitest';

import Command from '../../src/cmds/logout.js';
import config from '../../src/lib/config.js';
import configStore from '../../src/lib/configstore.js';

const cmd = new Command();

describe('rdme logout', () => {
  afterEach(() => {
    configStore.clear();
  });

  it("should report the user as logged out if they aren't logged in", () => {
    configStore.delete('email');
    configStore.delete('project');

    return expect(cmd.run({})).resolves.toBe(
      `You have logged out of ReadMe. Please use \`${config.cli} login\` to login again.`,
    );
  });

  it('should log the user out', async () => {
    configStore.set('email', 'email@example.com');
    configStore.set('project', 'subdomain');

    await expect(cmd.run({})).resolves.toBe(
      `You have logged out of ReadMe. Please use \`${config.cli} login\` to login again.`,
    );

    expect(configStore.get('email')).toBeUndefined();
    expect(configStore.get('project')).toBeUndefined();
  });
});
