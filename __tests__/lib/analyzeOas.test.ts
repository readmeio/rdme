import type { OASDocument } from 'oas/types';

import petstore from '@readme/oas-examples/3.0/json/petstore.json' with { type: 'json' };
import { describe, expect, it } from 'vitest';

import analyzeOas, { getSupportedFeatures } from '../../src/lib/analyzeOas.js';

describe('#analyzeOas', () => {
  it('should analyze an OpenAPI definition', async () => {
    const analysis = await analyzeOas(petstore as unknown as OASDocument);

    expect(analysis).toMatchSnapshot();
  });
});

describe('#getSupportedFeatures', () => {
  it('should return a list of supported features', () => {
    expect(getSupportedFeatures()).toStrictEqual([
      'additionalProperties',
      'callbacks',
      'circularRefs',
      'commonParameters',
      'discriminators',
      'links',
      'style',
      'polymorphism',
      'serverVariables',
      'webhooks',
      'xml',
      'xmlRequests',
      'xmlResponses',
      'xmlSchemas',
      'readme',
    ]);
  });
});
