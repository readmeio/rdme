import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import Command from '../../src/commands/logout.js';
import configStore from '../../src/lib/configstore.js';
import { type OclifOutput, runCommand } from '../helpers/oclif.js';

describe('rdme logout', () => {
  let run: (args?: string[]) => OclifOutput;

  beforeAll(() => {
    run = runCommand(Command);
  });

  afterEach(() => {
    configStore.clear();
  });

  it("should report the user as logged out if they aren't logged in", () => {
    configStore.delete('email');
    configStore.delete('project');

    return expect(run()).resolves.toMatchSnapshot();
  });

  it('should log the user out', async () => {
    configStore.set('email', 'email@example.com');
    configStore.set('project', 'subdomain');

    await expect(run()).resolves.toMatchSnapshot();

    expect(configStore.get('email')).toBeUndefined();
    expect(configStore.get('project')).toBeUndefined();
  });
});
