import type DocsPruneCommand from '../../src/commands/docs/prune.js';

import fs from 'node:fs';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import readPage from '../../src/lib/readDoc.js';

describe('#readPage', () => {
  let command: DocsPruneCommand;

  beforeEach(() => {
    command = {
      debug: vi.fn(),
    } as unknown as DocsPruneCommand;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should not execute JavaScript in frontmatter', () => {
    const maliciousContent = `---js
{
  title: "Test",
  malicious: (function() {
    // This should never execute
    return "executed";
  })()
}
---

# Page content`;

    const testFilePath = 'test-malicious.md';

    // Mock the file system to return our malicious content
    vi.spyOn(fs, 'readFileSync').mockReturnValue(maliciousContent);

    const result = readPage.call(command, testFilePath);

    // The data should be empty because we disabled the javascript engine
    // by providing a parse function that returns an empty object
    expect(result.data).toStrictEqual({});
    expect(result.content).toContain('# Page content');
  });

  it('should still parse regular YAML frontmatter', () => {
    const normalContent = `---
title: "Normal Page"
category: some-category
---

# Page content`;

    const testFilePath = 'test-normal.md';

    vi.spyOn(fs, 'readFileSync').mockReturnValue(normalContent);

    const result = readPage.call(command, testFilePath);

    expect(result.data).toStrictEqual({
      title: 'Normal Page',
      category: 'some-category',
    });
    expect(result.content).toContain('# Page content');
  });
});
