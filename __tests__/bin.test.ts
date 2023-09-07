import { exec } from 'node:child_process';

import { describe, it, expect } from 'vitest';

describe('bin', () => {
  it('should show our help screen', async () => {
    expect.assertions(1);

    await new Promise(resolve => {
      exec(`node ${__dirname}/../bin/rdme.js`, (error, stdout) => {
        expect(stdout).toContain('a utility for interacting with ReadMe');
        resolve(true);
      });
    });
  });
});
