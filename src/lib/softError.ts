export default class SoftError extends Error {
  constructor(output: string) {
    super(output);

    this.name = 'SoftError';
  }
}
