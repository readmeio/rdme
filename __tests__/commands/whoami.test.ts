import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import Command from '../../src/commands/whoami.js';
import configStore from '../../src/lib/configstore.js';
import { type OclifOutput, runCommand } from '../helpers/oclif.js';

describe('rdme whoami', () => {
  let run: (args?: string[]) => OclifOutput;

  beforeAll(() => {
    run = runCommand(Command);
  });

  afterEach(() => {
    configStore.clear();
  });

  it('should error if user is not authenticated', () => {
    configStore.delete('email');
    configStore.delete('project');

    return expect(run()).resolves.toMatchSnapshot();
  });

  it('should return the authenticated user', () => {
    configStore.set('email', 'email@example.com');
    configStore.set('project', 'subdomain');

    return expect(run()).resolves.toMatchSnapshot();
  });
});
