import type { CommandClass } from '../../src/index.js';
import type { OclifOutput } from '../helpers/oclif.js';

import debugModule from 'debug';
import { beforeEach, describe, expect, it } from 'vitest';

import DocsUploadCommand from '../../src/commands/docs/upload.js';
import LoginCommand from '../../src/commands/login.js';
import BaseCommand from '../../src/lib/baseCommand.js';
import configStore from '../../src/lib/configstore.js';
import { runCommand, setupOclifConfig } from '../helpers/oclif.js';

async function debugDuringInit(command: { init(): Promise<void> }) {
  const lines: unknown[][] = [];
  const previousNamespaces = debugModule.disable();
  const previousLog = debugModule.log;
  debugModule.enable('*');
  debugModule.log = (...args: unknown[]) => {
    lines.push(args);
  };

  try {
    await command.init();
  } finally {
    debugModule.log = previousLog;
    debugModule.enable(previousNamespaces);
  }

  return lines.flat().map(String).join('\n');
}

class TestCommand extends BaseCommand<typeof BaseCommand> {
  async run() {
    this.info('Running test command');

    const result = await this.runRdmeCommand('whoami');

    return result;
  }
}

describe('BaseCommand', () => {
  let run: (args?: string[]) => OclifOutput;

  describe('#runRdmeCommand', () => {
    beforeEach(() => {
      configStore.clear();
      run = runCommand(TestCommand as CommandClass);
    });

    it('should run another rdme command', async () => {
      const result = await run();

      expect(result).toMatchSnapshot();
    });
  });

  it('does not debug credential flags', async () => {
    const config = await setupOclifConfig();
    const password = 'hunter2-unique';
    const otp = 'otp-998877';
    const command = new LoginCommand(
      ['--email', 'user@example.com', '--password', password, '--project', 'proj', '--otp', otp],
      config,
    );
    const logged = await debugDuringInit(command);
    expect(logged).not.toContain(password);
    expect(logged).not.toContain(otp);
    expect(logged).toContain('[REDACTED]');
    expect(logged).toContain('user@example.com');
    expect(command.flags.password).toBe(password);
    expect(command.flags.otp).toBe(otp);
  });

  it('does not debug a dash-prefixed password', async () => {
    const config = await setupOclifConfig();
    const password = '-hunter2-unique';
    const command = new LoginCommand(
      ['--email', 'user@example.com', '--password', password, '--project', 'proj'],
      config,
    );
    const logged = await debugDuringInit(command);
    expect(logged).not.toContain(password);
    expect(logged).toContain('[REDACTED]');
    expect(logged).toContain('user@example.com');
    expect(command.flags.password).toBe(password);
  });

  it('does not debug the api key flag', async () => {
    const config = await setupOclifConfig();
    const key = 'rdme_flagkey_998877';
    const command = new DocsUploadCommand(['test/__fixtures__/docs/gha-inject/page.md', '--key', key], config);
    const logged = await debugDuringInit(command);
    expect(logged).not.toContain(key);
    expect(logged).toContain('[REDACTED]');
    expect(command.flags.key).toBe(key);
  });
});
