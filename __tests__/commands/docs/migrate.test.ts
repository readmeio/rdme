import { beforeAll, describe, expect, it } from 'vitest';

import Command from '../../../src/commands/docs/migrate.js';
import { runCommand, type OclifOutput } from '../../helpers/oclif.js';

describe('rdme docs migrate', () => {
  let run: (args?: string[]) => OclifOutput;

  beforeAll(() => {
    run = runCommand(Command);
  });

  it('should error out if no path is passed', async () => {
    const output = await run();
    expect(output).toMatchSnapshot();
  });

  it('should error out if no plugins are installed', async () => {
    const output = await run(['__tests__/__fixtures__/docs/new-docs']);
    expect(output).toMatchSnapshot();
  });

  it.todo('should load plugin and transform docs');
});
