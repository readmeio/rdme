import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import readdirRecursive from '../../src/lib/readdirRecursive.js';

describe('#readdirRecursive', () => {
  let tmpDir: string;
  let previousCwd: string;

  beforeEach(() => {
    previousCwd = process.cwd();
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

    // Production callers pass a relative working directory (typically `.`).
    // The `ignore` package rejects absolute paths.
    process.chdir(tmpDir);
  });

  afterEach(() => {
    process.chdir(previousCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should recursively list files including ignored and git metadata when ignoreGit is false', () => {
    const files = readdirRecursive('.').sort();

    expect(files).toContain(path.join('.', 'keep.md'));
    expect(files).toContain(path.join('.', 'secret.txt'));
    expect(files).toContain(path.join('.', 'debug.log'));
    expect(files).toContain(path.join('.', 'nested', 'keep.md'));
    expect(files).toContain(path.join('.', 'nested', 'debug.log'));
    expect(files).toContain(path.join('.', 'nested', 'deeper', 'leaf.md'));
    expect(files).toContain(path.join('.', '.git', 'config'));
    expect(files).toContain(path.join('.', '.gitignore'));
  });

  it('should honor a top-level .gitignore and skip the .git directory when ignoreGit is true', () => {
    const files = readdirRecursive('.', true);

    expect(files).toContain(path.join('.', 'keep.md'));
    expect(files).toContain(path.join('.', 'nested', 'keep.md'));
    expect(files).toContain(path.join('.', 'nested', 'deeper', 'leaf.md'));
    expect(files).not.toContain(path.join('.', 'secret.txt'));
    expect(files).not.toContain(path.join('.', 'debug.log'));
    expect(files).not.toContain(path.join('.', '.git', 'config'));
  });
});
