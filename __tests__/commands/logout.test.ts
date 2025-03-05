import { describe, afterEach, beforeAll, it, expect } from 'vitest';

import pkg from '../../package.json' with { type: 'json' };
import Command from '../../src/commands/logout.js';
import configStore from '../../src/lib/configstore.js';
import { runCommand, type OclifOutput } from '../helpers/oclif.js';

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
