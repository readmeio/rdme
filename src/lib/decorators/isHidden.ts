/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * This TypeScript decorator will cause the decorated command to be hidden from all help and
 * "Related commands" screens.
 *
 * @see {@link https://www.typescriptlang.org/docs/handbook/decorators.html#class-decorators}
 */
export default function isHidden<T extends { new (...args: any[]): {} }>(constructor: T) {
  return class extends constructor {
    hidden = true;
  };
}
