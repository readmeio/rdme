import { describe, afterEach, it, expect, beforeAll } from 'vitest';

import pkg from '../../package.json';
import Command from '../../src/commands/whoami.js';
import configStore from '../../src/lib/configstore.js';
import { runCommandAndReturnResult } from '../helpers/oclif.js';

describe('rdme whoami', () => {
  let run: (args?: string[]) => Promise<string>;

  beforeAll(() => {
    run = (args: string[]) => runCommandAndReturnResult(Command)(args);
  });

  afterEach(() => {
    configStore.clear();
  });

  it('should error if user is not authenticated', () => {
    configStore.delete('email');
    configStore.delete('project');

    return expect(run()).rejects.toStrictEqual(new Error(`Please login using \`${pkg.name} login\`.`));
  });

  it('should return the authenticated user', () => {
    configStore.set('email', 'email@example.com');
    configStore.set('project', 'subdomain');

    return expect(run()).resolves.toBe('You are currently logged in as email@example.com to the subdomain project.');
  });
});
