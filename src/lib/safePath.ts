import path from 'node:path';

/**
 * Determine if a URL path segment is safe to use as a filesystem path component, preventing us
 * from treating a path segment as a potential directory traversal attack.
 *
 */
export function isSafePathSegment(segment: unknown): boolean {
  if (!segment || typeof segment !== 'string') return false;
  if (segment === '.' || segment === '..') return false;

  // oxlint-disable-next-line no-control-regex
  if (/[\0/\\]/.test(segment)) return false;

  if (segment.includes('..')) return false;

  return true;
}

/**
 * Decode the last path segment of a URI and validate it as a safe path component.
 *
 */
export function decodeURILastSegment(uri: string): string | null {
  const encoded = uri.split('/').pop() || '';
  let decoded: string;

  try {
    decoded = decodeURIComponent(encoded);
  } catch {
    return null;
  }

  return isSafePathSegment(decoded) ? decoded : null;
}

/**
 * Resolve the segments of a supplied path within a root directory and only return the path if it
 * is contained within the supplied root.
 *
 */
export function resolvePathWithinRoot(root: string, ...segments: string[]): string | null {
  const resolvedRoot = path.resolve(root);
  const dest = path.resolve(resolvedRoot, ...segments);

  if (dest === resolvedRoot || dest.startsWith(`${resolvedRoot}${path.sep}`)) {
    return dest;
  }

  return null;
}
