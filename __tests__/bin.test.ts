import { exec } from 'node:child_process';

import { describe, expect, it } from 'vitest';

describe('bin', () => {
  it('should show our help screen', async () => {
    expect.assertions(1);

    await new Promise(resolve => {
      exec(`node ${__dirname}/../bin/run.js`, (error, stdout) => {
        expect(stdout).toContain("ReadMe's official CLI and GitHub Action");

        resolve(true);
      });
    });
  });
});
