import fs from 'fs';

import { validateFilePath } from '../../src/lib/validatePromptInput';

describe('#validateFilePath', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return error for empty path value', () => {
    return expect(validateFilePath('')).toBe('An output path must be supplied.');
  });

  it('should return error if path already exists', () => {
    expect.assertions(2);
    const testPath = 'path-that-already-exists';

    fs.existsSync = jest.fn(() => true);

    expect(validateFilePath(testPath)).toBe('Specified output path already exists.');
    expect(fs.existsSync).toHaveBeenCalledWith(testPath);
  });

  it("should return true if the path doesn't exist", () => {
    expect.assertions(2);
    const testPath = 'path-that-does-not-exist';

    fs.existsSync = jest.fn(() => false);

    expect(validateFilePath(testPath)).toBe(true);
    expect(fs.existsSync).toHaveBeenCalledWith(testPath);
  });
});
