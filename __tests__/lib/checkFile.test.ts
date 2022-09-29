import fs from 'fs';

import { checkFilePath } from '../../src/lib/checkFile';

describe('#checkFilePath', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return error for empty path value', () => {
    return expect(checkFilePath('')).toBe('An output path must be supplied.');
  });

  it('should return error if path already exists', () => {
    expect.assertions(2);
    const testPath = 'path-that-already-exists';

    fs.existsSync = jest.fn(() => true);

    expect(checkFilePath(testPath)).toBe('Specified output path already exists.');
    expect(fs.existsSync).toHaveBeenCalledWith(testPath);
  });

  it("should return true if the path doesn't exist", () => {
    expect.assertions(2);
    const testPath = 'path-that-does-not-exist';

    fs.existsSync = jest.fn(() => false);

    expect(checkFilePath(testPath)).toBe(true);
    expect(fs.existsSync).toHaveBeenCalledWith(testPath);
  });
});
