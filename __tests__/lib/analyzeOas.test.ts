import type { OASDocument } from 'oas/dist/rmoas.types';

import petstore from '@readme/oas-examples/3.0/json/petstore.json';

import analyzeOas from '../../src/lib/analyzeOas';

describe('analyzeOas', () => {
  it('should analyze an OpenAPI definition', async () => {
    const analysis = await analyzeOas(petstore as unknown as OASDocument);

    expect(analysis).toMatchSnapshot();
  });
});
