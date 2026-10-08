import type { AnySchema } from 'ajv';
import type { MatcherResult } from 'vitest';

import betterAjvErrors from '@readme/better-ajv-errors';
import { Ajv } from 'ajv';
import { load as loadYAML } from 'js-yaml';

declare module 'vitest' {
  interface Matchers<R, T> {
    /**
     * Ensures that the expected YAML conforms to the given JSON Schema.
     */
    toBeValidSchema(schema: unknown): R;
  }
}

export function toBeValidSchema(
  /** The input YAML, as a string */
  yaml: string,
  /** The JSON schema file */
  schema: AnySchema,
): MatcherResult {
  const ajv = new Ajv({ strictTypes: false, strictTuples: false });

  const data = loadYAML(yaml);

  const validate = ajv.compile(schema);
  const valid = validate(data);

  if (!valid) {
    let output = 'expected YAML to be valid';

    if (validate.errors) {
      // @ts-expect-error this still works, not sure why TS is flagging it
      output = `${output}, here's the validation error\n\n${betterAjvErrors(schema, data, validate.errors)}`;
    }

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
