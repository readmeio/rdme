import type { ExpectationResult } from '@vitest/expect';
import type { AnySchema } from 'ajv';

import betterAjvErrors from '@readme/better-ajv-errors';
import Ajv from 'ajv';
import jsYaml from 'js-yaml';
import { expect } from 'vitest';

interface CustomMatchers<R = unknown> {
  /**
   * Ensures that the decoded Basic Auth header matches the expected API key.
   */
  toBeBasicAuthApiKey(expectedApiKey: string): R;
  /**
   * Ensures that the expected YAML conforms to the given JSON Schema.
   */
  toBeValidSchema(schema: unknown): R;
}

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

function toBeBasicAuthApiKey(actualAuthorizationHeader: string, expectedApiKey: string): ExpectationResult {
  const encodedApiKey = actualAuthorizationHeader.split(' ')[1];
  const decodedApiKey = Buffer.from(encodedApiKey, 'base64').toString().replace(/:$/, '');
  if (decodedApiKey !== expectedApiKey) {
    return {
      message: () => 'expected Basic Auth header to match API key',
      pass: false,
      actual: decodedApiKey,
      expected: expectedApiKey,
    };
  }

  return {
    message: () => 'expected Basic Auth header to not match API key',
    pass: true,
  };
}

function toBeValidSchema(
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

expect.extend({ toBeBasicAuthApiKey, toBeValidSchema });
