/**
 * A lightweight Error wrapper that we use for outputting errors that don't need aggressive red
 * coloring or to be printed with `console.error()`.
 *
 */
export default class SoftError extends Error {
  constructor(output: string) {
    super(output);

    this.name = 'SoftError';
  }
}
