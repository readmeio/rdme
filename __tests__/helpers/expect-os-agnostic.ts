/* eslint-disable jest/valid-expect */

const normalizeString = (str: string) => str.replace(/\\/g, '/');

/**
 * Normalize all data expectations to be OS-agnostic and match against Unix-based filesystems
 * that have path separators of a forward slash.
 *
 */
export default function expectOSAgnostic(actual: any) {
  if (typeof actual === 'object') {
    if (typeof actual.then === 'function') {
      return expect(
        actual
          .then((res: any) => {
            if (typeof res === 'string') {
              return normalizeString(res);
            }

            return res;
          })
          .catch(err => {
            // eslint-disable-next-line no-param-reassign
            err.message = normalizeString(err.message);
            throw err;
          })
      );
    }
  } else if (typeof actual === 'string') {
    return expect(normalizeString(actual));
  }

  return expect(actual);
}
