import fs from 'node:fs';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { cleanFileName, validateFilePath, validateSubdomain } from '../../src/lib/validatePromptInput.js';

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

  it('should apply getFullPath before checking existence', () => {
    expect.assertions(3);

    fs.existsSync = vi.fn(() => false);
    const getFullPath = vi.fn((file: string) => `.github/workflows/${file}.yml`);

    expect(validateFilePath('rdme-openapi', getFullPath)).toBe(true);
    expect(getFullPath).toHaveBeenCalledWith('rdme-openapi');
    expect(fs.existsSync).toHaveBeenCalledWith('.github/workflows/rdme-openapi.yml');
  });
});

describe('#cleanFileName', () => {
  it('should replace non-alphanumeric characters with hyphens', () => {
    expect(cleanFileName('Hello World!')).toBe('Hello-World-');
    expect(cleanFileName('rdme-openapi:upload')).toBe('rdme-openapi-upload');
    expect(cleanFileName('already-ok_123')).toBe('already-ok-123');
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

  it.each(['', '-', '-leading', 'trailing-', 'consec--utive', 'under_score', 'dot.value'])(
    'should reject invalid subdomain %j',
    value => {
      expect(validateSubdomain(value)).toBe('Project subdomain must contain only letters, numbers and dashes.');
    },
  );
});
