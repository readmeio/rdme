/* eslint-disable jest/valid-expect */
/**
 * Normalize all data expectations to be OS-agnostic and match against Unix-based filesystems
 * that have path separators of a forward slash.
 *
 */
export default function expectOSAgnostic(actual: any) {
  if (typeof actual === 'object') {
    if (typeof actual.then === 'function') {
      return expect(actual.then((str: string) => str.replace(/\\/g, '/')));
    }
  } else if (typeof actual === 'string') {
    return expect(actual.replace(/\\/g, '/'));
  }

  return expect(actual);
}
