import { describe, afterEach, beforeAll, it, expect } from 'vitest';

import pkg from '../../package.json';
import Command from '../../src/commands/logout.js';
import configStore from '../../src/lib/configstore.js';
import { runCommand } from '../helpers/setup-oclif-config.js';

describe('rdme logout', () => {
  let run: (args?: string[]) => Promise<string>;

  beforeAll(() => {
    run = runCommand(Command);
  });

  afterEach(() => {
    configStore.clear();
  });

  it("should report the user as logged out if they aren't logged in", () => {
    configStore.delete('email');
    configStore.delete('project');

    return expect(run()).resolves.toBe(
      `You have logged out of ReadMe. Please use \`${pkg.name} login\` to login again.`,
    );
  });

  it('should log the user out', async () => {
    configStore.set('email', 'email@example.com');
    configStore.set('project', 'subdomain');

    await expect(run()).resolves.toBe(
      `You have logged out of ReadMe. Please use \`${pkg.name} login\` to login again.`,
    );

    expect(configStore.get('email')).toBeUndefined();
    expect(configStore.get('project')).toBeUndefined();
  });
});
