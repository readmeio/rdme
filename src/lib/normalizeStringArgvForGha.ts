/**
 * When `INPUT_RDME` is parsed with `string-argv`, tokens like `--flag="value"` remain a single
 * argv element whose suffix includes literal quote characters. A real shell strips those quotes
 * before invoking Node, so we normalize to match shell and `process.argv` behavior.
 *
 */
export function normalizeStringArgvForGha(argv: string[]): string[] {
  return argv.map(token => {
    if (!token.startsWith('--') || !token.includes('=')) {
      return token;
    }

    const eq = token.indexOf('=');
    const prefix = token.slice(0, eq + 1);
    const value = token.slice(eq + 1);

    if (value.length >= 2) {
      const open = value[0];
      const close = value[value.length - 1];
      if ((open === '"' && close === '"') || (open === "'" && close === "'")) {
        return prefix + value.slice(1, -1);
      }
    }

    return token;
  });
}
