import type { ExpectationResult } from '@vitest/expect';
import type { AnySchema } from 'ajv';

import betterAjvErrors from '@readme/better-ajv-errors';
import { Ajv } from 'ajv';
import jsYaml from 'js-yaml';

interface CustomMatchers<R = unknown> {
  /**
   * Ensures that the expected YAML conforms to the given JSON Schema.
   */
  toBeValidSchema(schema: unknown): R;
}

declare module 'vitest' {
  // biome-ignore lint/suspicious/noExplicitAny: This is the type for a custom matcher.
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

export function toBeValidSchema(
  /** The input YAML, as a string */
  yaml: string,
  /** The JSON schema file */
  schema: AnySchema,
): ExpectationResult {
  const ajv = new Ajv({ strictTypes: false, strictTuples: false });

  const data = jsYaml.load(yaml);

  const validate = ajv.compile(schema);
  const valid = validate(data);

  if (!valid) {
    let output = 'expected YAML to be valid';

    if (validate.errors)
      // @ts-expect-error this still works, not sure why TS is flagging it
      output = `${output}, here's the validation error\n\n${betterAjvErrors(schema, data, validate.errors)}`;

    return {
      message: () => output,
      pass: false,
    };
  }

  return {
    message: () => 'expected YAML to be invalid',
    pass: true,
  };
}
