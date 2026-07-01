import type { OASAnalysis, OASAnalysisFeature } from 'oas/analyzer/types';
import type { OASDocument } from 'oas/types';

import { analyzer } from 'oas/analyzer';

export interface AnalyzedFeature extends OASAnalysisFeature {
  description: string;

  /**
   * The analyzed feature is not worth reporting within the inspector.
   */
  hidden?: boolean;

  url?:
    | string
    | {
        /**
         * OpenAPI 3.1 introduced some new features so there won't be any docs on 3.0.
         */
        '3.0'?: string;
        '3.1': string;
      };
}

export interface Analysis extends OASAnalysis {
  openapi: {
    additionalProperties: AnalyzedFeature;
    callbacks: AnalyzedFeature;
    circularRefs: AnalyzedFeature;
    commonParameters: AnalyzedFeature;
    discriminators: AnalyzedFeature;
    links: AnalyzedFeature;
    polymorphism: AnalyzedFeature;
    references: OASAnalysisFeature;
    serverVariables: AnalyzedFeature;
    style: AnalyzedFeature;
    webhooks: AnalyzedFeature;
    xmlRequests: AnalyzedFeature;
    xmlResponses: AnalyzedFeature;
    xmlSchemas: AnalyzedFeature;
  };
}

const OPENAPI_FEATURE_DOCS: Record<
  keyof Analysis['openapi'],
  Pick<AnalyzedFeature, 'description' | 'hidden' | 'url'>
> = {
  additionalProperties: {
    description: 'additionalProperties allows you to document dictionaries where the keys are user-supplied strings.',
    url: {
      '3.0': 'https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.4.md#schema-object',
      '3.1': 'https://json-schema.org/understanding-json-schema/reference/object.html#additional-properties',
    },
  },
  callbacks: {
    description:
      'Callbacks are asynchronous, out-of-band requests that your service will send to some other service in response to certain events.',
    url: {
      '3.0': 'https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.4.md#callback-object',
      '3.1': 'https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.1.md#callback-object',
    },
  },
  circularRefs: {
    description: 'Circular references are $ref pointers that at some point in their lineage reference themselves.',
  },
  commonParameters: {
    description:
      'Common parameters allow you to define parameters that are shared across multiple operations within your API.',
    url: {
      '3.0': 'https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.4.md#path-item-object',
      '3.1': 'https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.1.md#path-item-object',
    },
  },
  discriminators: {
    description:
      'With schemas that can be, or contain, different shapes, discriminators help you assist your users in identifying and determining the kind of shape they can supply or receive.',
    url: {
      '3.0': 'https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.4.md#discriminator-object',
      '3.1': 'https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.1.md#discriminator-object',
    },
  },
  links: {
    description: 'Links allow you to define at call-time relationships to other operations within your API.',
    url: {
      '3.0': 'https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.4.md#link-object',
      '3.1': 'https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.1.md#link-object',
    },
  },
  style: {
    description: 'Parameter serialization (style) allows you to describe how the parameter should be sent to your API.',
    url: {
      '3.0': 'https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.4.md#parameter-style',
      '3.1': 'https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.1.md#parameter-style',
    },
  },
  polymorphism: {
    description:
      'Polymorphism (allOf, oneOf, and anyOf) allow you to describe schemas that may contain either many different shapes, or a single shape containing multiple different schemas.',
    url: {
      '3.0': 'https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.4.md#schema-object',
      '3.1': 'https://json-schema.org/understanding-json-schema/reference/combining.html',
    },
  },
  references: {
    description: 'Determines the presence of the `$ref` pointers.',
    url: {
      '3.0': 'https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.4.md#reference-object',
      '3.1': 'https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.1.md#reference-object',
    },
  },
  serverVariables: {
    description: 'Server variables allow to do user-supplied variable subsitituions within your API server URL.',
    url: {
      '3.0': 'https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.4.md#server-variable-object',
      '3.1': 'https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.1.md#server-variable-object',
    },
  },
  webhooks: {
    description: 'Webhooks allow you to describe out of band requests that may be initiated by your users.',
    url: {
      '3.1': 'https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.1.md#user-content-oaswebhooks',
    },
  },
  xmlRequests: {
    description: 'Any request body that accepts an XML payload.',
    url: {
      '3.0': 'https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.4.md#request-body-object',
      '3.1': 'https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.1.md#request-body-object',
    },
  },
  xmlResponses: {
    description: 'Any response that returns an XML payload.',
    url: {
      '3.0': 'https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.4.md#media-type-object',
      '3.1': 'https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.1.md#media-type-object',
    },
  },
  xmlSchemas: {
    description: 'Any schema that utilizes the XML object for defining its shape in an XML payload.',
    url: {
      '3.0': 'https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.4.md#xml-object',
      '3.1': 'https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.1.md#xml-object',
    },
  },
};

/**
 * Analyze a given OpenAPI or Swagger definition for any OpenAPI, JSON Schema, and ReadMe-specific
 * feature uses it may contain.
 *
 */
async function analyzeOas(definition: OASDocument) {
  return analyzer(definition).then(analysisResult => {
    const analysis = analysisResult as Analysis;
    if (analysis.openapi) {
      Object.entries(OPENAPI_FEATURE_DOCS).forEach(([feature, docs]) => {
        analysis.openapi[feature as keyof Analysis['openapi']] = {
          ...analysis.openapi[feature as keyof Analysis['openapi']],
          ...docs,
        };
      });
    }

    return analysis;
  });
}

export function getSupportedFeatures() {
  return Object.keys(OPENAPI_FEATURE_DOCS);
}

export default analyzeOas;
