import type { AnySchema } from 'ajv';

import betterAjvErrors from '@readme/better-ajv-errors';
import Ajv from 'ajv';
import jsYaml from 'js-yaml';

interface CustomMatchers<R = unknown> {
  /**
   * Ensures that the expected YAML conforms to the given JSON Schema.
   */
  toBeValidSchema(schema: unknown): R;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Matchers<R> extends CustomMatchers<R> {}
  }
}

export default function toBeValidSchema(
  this: jest.MatcherUtils,
  /** The input YAML, as a string */
  yaml: string,
  /** The JSON schema file */
  schema: AnySchema,
): { message: () => string; pass: boolean } {
  const ajv = new Ajv({ strictTypes: false, strictTuples: false });

  const data = jsYaml.load(yaml);

  const validate = ajv.compile(schema);
  const valid = validate(data);

  if (!valid) {
    let output = 'expected YAML to be valid';

    if (validate.errors)
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

expect.extend({ toBeValidSchema });
