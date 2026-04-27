import { exec } from 'node:child_process';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('bin', () => {
  it('should show our help screen', async () => {
    expect.assertions(1);

    await new Promise(resolve => {
      exec(`node ${path.join(__dirname, '/../bin/run.js')}`, (error, stdout) => {
        expect(stdout).toContain("ReadMe's official CLI and GitHub Action");

        resolve(true);
      });
    });
  });
});
