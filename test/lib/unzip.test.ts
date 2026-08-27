import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { attemptUnzip } from '../../src/lib/unzip.js';

describe('#attemptUnzip', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rdme-unzip-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should pass through non-zip paths unchanged', async () => {
    const pathInput = path.join(tmpDir, 'docs');
    fs.mkdirSync(pathInput);

    await expect(attemptUnzip(pathInput)).resolves.toStrictEqual({ pathInput, zipped: false });
  });

  it('should extract a zip into a directory named after the archive', async () => {
    const sourceDir = path.join(tmpDir, 'guides');
    fs.mkdirSync(sourceDir);
    fs.writeFileSync(path.join(sourceDir, 'intro.md'), '---\ntitle: Intro\n---\n');

    const zipPath = path.join(tmpDir, 'guides.zip');
    execFileSync('zip', ['-r', zipPath, 'guides'], { cwd: tmpDir });

    const result = await attemptUnzip(zipPath);

    expect(result.zipped).toBe(true);
    if (result.zipped) {
      expect(result.pathInput).toBe(result.unzippedDir);
      expect(result.pathInput.endsWith(`${path.sep}guides`)).toBe(true);
      expect(fs.existsSync(path.join(result.pathInput, 'intro.md'))).toBe(true);
    }
  });

  it('should not throw when a .zip file cannot be extracted', async () => {
    const zipPath = path.join(tmpDir, 'broken.zip');
    fs.writeFileSync(zipPath, 'this is not a zip file');

    await expect(attemptUnzip(zipPath)).resolves.toStrictEqual({ pathInput: zipPath, zipped: false });
  });
});
