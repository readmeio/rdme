export default class SoftError extends Error {
  code: string;

  constructor(output: string) {
    super(output);

    this.name = 'SoftError';
  }
}
