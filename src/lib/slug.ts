/**
 * ASCII controls, including DEL. The WHATWG URL parser strips tab, newline, and
 * carriage return instead of rejecting them, so those characters have to be
 * refused before the parser sees the slug. Separators, `?`, `#`, and dot
 * segments are left to the parser check below.
 */
// oxlint-disable-next-line no-control-regex -- ASCII controls are not a single path segment
const ASCII_CONTROLS = /[\u0000-\u001f\u007f]/;

/**
 * True when interpolating `slug` into a URL path leaves exactly one segment.
 * `fetch` uses this parser, which resolves `.` and `..` (including `%2e` and
 * `%2e%2e`) and treats `?` and `#` as the start of a query or fragment.
 */
function isSingleUrlSegment(slug: string): boolean {
  if (!slug || ASCII_CONTROLS.test(slug)) return false;

  const parsed = new URL(`https://example.com/prefix/${slug}`);
  if (parsed.search || parsed.hash || parsed.origin !== 'https://example.com') return false;
  if (!parsed.pathname.startsWith('/prefix/')) return false;

  const rest = parsed.pathname.slice('/prefix/'.length);
  return rest.length > 0 && !rest.includes('/') && rest !== '.' && rest !== '..';
}

/**
 * Require `value` to be one URL path segment. `filePath` is only used in the error.
 * `kind` selects the noun in that error (`slug` or `branch`).
 */
export function assertSlug(value: unknown, filePath: string, kind: 'branch' | 'slug' = 'slug'): string {
  if (typeof value !== 'string' || !isSingleUrlSegment(value)) {
    const noun = kind === 'branch' ? 'branches' : 'slugs';
    throw new Error(`Invalid ${kind} in ${filePath}: ${noun} must be a single URL-safe path segment.`);
  }

  return value;
}
