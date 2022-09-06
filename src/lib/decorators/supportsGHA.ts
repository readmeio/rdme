/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * This TypeScript decorator will enable the GitHub Action onboarding workflow
 * for the decorated command.
 *
 * @see {@link https://www.typescriptlang.org/docs/handbook/decorators.html#class-decorators}
 */
export default function supportsGHA<T extends { new (...args: any[]): {} }>(constructor: T) {
  return class extends constructor {
    supportsGHA = true;
  };
}
