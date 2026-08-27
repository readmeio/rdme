import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import readdirRecursive from '../../src/lib/readdirRecursive.js';

describe('#readdirRecursive', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rdme-readdir-'));
    fs.mkdirSync(path.join(tmpDir, 'nested', 'deeper'), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, '.git'));

    fs.writeFileSync(path.join(tmpDir, 'keep.md'), 'ok');
    fs.writeFileSync(path.join(tmpDir, 'secret.txt'), 'nope');
    fs.writeFileSync(path.join(tmpDir, 'debug.log'), 'log');
    fs.writeFileSync(path.join(tmpDir, 'nested', 'keep.md'), 'ok');
    fs.writeFileSync(path.join(tmpDir, 'nested', 'debug.log'), 'log');
    fs.writeFileSync(path.join(tmpDir, 'nested', 'deeper', 'leaf.md'), 'ok');
    fs.writeFileSync(path.join(tmpDir, '.git', 'config'), 'git');
    fs.writeFileSync(path.join(tmpDir, '.gitignore'), ['secret.txt', '*.log'].join('\n'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should recursively list files including ignored and git metadata when ignoreGit is false', () => {
    const files = readdirRecursive(tmpDir).sort();

    expect(files).toContain(path.join(tmpDir, 'keep.md'));
    expect(files).toContain(path.join(tmpDir, 'secret.txt'));
    expect(files).toContain(path.join(tmpDir, 'debug.log'));
    expect(files).toContain(path.join(tmpDir, 'nested', 'keep.md'));
    expect(files).toContain(path.join(tmpDir, 'nested', 'debug.log'));
    expect(files).toContain(path.join(tmpDir, 'nested', 'deeper', 'leaf.md'));
    expect(files).toContain(path.join(tmpDir, '.git', 'config'));
    expect(files).toContain(path.join(tmpDir, '.gitignore'));
  });

  it('should honor a top-level .gitignore and skip the .git directory when ignoreGit is true', () => {
    const files = readdirRecursive(tmpDir, true);

    expect(files).toContain(path.join(tmpDir, 'keep.md'));
    expect(files).toContain(path.join(tmpDir, 'nested', 'keep.md'));
    expect(files).toContain(path.join(tmpDir, 'nested', 'deeper', 'leaf.md'));
    expect(files).not.toContain(path.join(tmpDir, 'secret.txt'));
    expect(files).not.toContain(path.join(tmpDir, 'debug.log'));
    expect(files).not.toContain(path.join(tmpDir, '.git', 'config'));
  });
});
