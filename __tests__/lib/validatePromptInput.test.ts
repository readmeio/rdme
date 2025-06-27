import fs from 'node:fs';

import { describe, afterEach, it, expect, vi } from 'vitest';

import { validateFilePath, validateSubdomain } from '../../src/lib/validatePromptInput.js';

describe('#validateFilePath', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return error for empty path value', () => {
    return expect(validateFilePath('')).toBe('An output path must be supplied.');
  });

  it('should return error if path already exists', () => {
    expect.assertions(2);

    const testPath = 'path-that-already-exists';

    fs.existsSync = vi.fn(() => true);

    expect(validateFilePath(testPath)).toBe('Specified output path already exists.');
    expect(fs.existsSync).toHaveBeenCalledWith(testPath);
  });

  it("should return true if the path doesn't exist", () => {
    expect.assertions(2);

    const testPath = 'path-that-does-not-exist';

    fs.existsSync = vi.fn(() => false);

    expect(validateFilePath(testPath)).toBe(true);
    expect(fs.existsSync).toHaveBeenCalledWith(testPath);
  });
});

describe('#validateSubdomain', () => {
  it('should validate basic subdomain', () => {
    expect(validateSubdomain('subdomain')).toBe(true);
  });

  it('should validate subdomain with other characters', () => {
    expect(validateSubdomain('test-Subdomain123')).toBe(true);
  });

  it('should reject subdomain with spaces', () => {
    expect(validateSubdomain('test subdomain')).toBe(
      'Project subdomain must contain only letters, numbers and dashes.',
    );
  });

  it('should reject subdomain with special characters', () => {
    expect(validateSubdomain('test-subdomain!')).toBe(
      'Project subdomain must contain only letters, numbers and dashes.',
    );
  });
});
