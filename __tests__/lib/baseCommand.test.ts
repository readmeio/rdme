import type { CommandClass } from '../../src/index.js';

import { beforeEach, describe, expect, it } from 'vitest';

import BaseCommand from '../../src/lib/baseCommand.js';
import configStore from '../../src/lib/configstore.js';
import { type OclifOutput, runCommand } from '../helpers/oclif.js';

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
    beforeEach(async () => {
      configStore.clear();
      run = runCommand(TestCommand as CommandClass);
    });

    it('should run another rdme command', async () => {
      const result = await run();

      expect(result).toMatchSnapshot();
    });
  });
});
