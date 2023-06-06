import type { OASAnalysis, OASAnalysisFeature } from 'oas/dist/analyzer';
import type { OASDocument } from 'oas/dist/rmoas.types';

import analyzer from 'oas/dist/analyzer';

export interface AnalyzedFeature extends OASAnalysisFeature {
  description: string;
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
    discriminators: AnalyzedFeature;
    links: AnalyzedFeature;
    polymorphism: AnalyzedFeature;
    serverVariables: AnalyzedFeature;
    style: AnalyzedFeature;
    webhooks: AnalyzedFeature;
    xml: AnalyzedFeature;
  };
  readme: {
    /**
     * RAW_BODY is specific to our Manual API editor and we don't recommend anyone writing their
     * own API definition should use it so this is considered deprecated.
     */
    raw_body?: AnalyzedFeature;

    'x-default': AnalyzedFeature;
    'x-readme.code-samples': AnalyzedFeature;
    'x-readme.explorer-enabled': AnalyzedFeature;
    'x-readme.headers': AnalyzedFeature;
    'x-readme.proxy-enabled': AnalyzedFeature;

    /**
     * @deprecated `samples-enabled` is deprecated.
     */
    'x-readme.samples-enabled'?: AnalyzedFeature;
    'x-readme.samples-languages'?: AnalyzedFeature;
  };
}

const OPENAPI_FEATURE_DOCS: Record<keyof Analysis['openapi'], Pick<AnalyzedFeature, 'description' | 'url'>> = {
  additionalProperties: {
    description: 'additionalProperties allows you to document dictionaries where the keys are user-supplied strings.',
    url: {
      '3.0': 'https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md#schema-object',
      '3.1': 'https://json-schema.org/understanding-json-schema/reference/object.html#additional-properties',
    },
  },
  callbacks: {
    description:
      'Callbacks are asynchronous, out-of-band requests that your service will send to some other service in response to certain events.',
    url: {
      '3.0': 'https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md#callback-object',
      '3.1': 'https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#callback-object',
    },
  },
  circularRefs: {
    description: 'Circular references are $ref pointers that at some point in their lineage reference themselves.',
  },
  discriminators: {
    description:
      'With schemas that can be, or contain, different shapes, discriminators help you assist your users in identifying and determining the kind of shape they can supply or receive.',
    url: {
      '3.0': 'https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md#discriminator-object',
      '3.1': 'https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#discriminator-object',
    },
  },
  links: {
    description: 'Links allow you to define at call-time relationships to other operations within your API.',
    url: {
      '3.0': 'https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md#link-object',
      '3.1': 'https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#link-object',
    },
  },
  style: {
    description: 'Parameter serialization (style) allows you to describe how the parameter should be sent to your API.',
    url: {
      '3.0': 'https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md#parameter-style',
      '3.1': 'https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#parameter-style',
    },
  },
  polymorphism: {
    description:
      'Polymorphism (allOf, oneOf, and anyOf) allow you to describe schemas that may contain either many different shapes, or a single shape containing multiple different schemas.',
    url: {
      '3.0': 'https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md#schema-object',
      '3.1': 'https://json-schema.org/understanding-json-schema/reference/combining.html',
    },
  },
  serverVariables: {
    description: 'Server variables allow to do user-supplied variable subsitituions within your API server URL.',
    url: {
      '3.0': 'https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md#server-variable-object',
      '3.1': 'https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#server-variable-object',
    },
  },
  webhooks: {
    description: 'Webhooks allow you to describe out of band requests that may be initiated by your users.',
    url: {
      '3.1': 'https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#user-content-oaswebhooks',
    },
  },
  xml: {
    description: 'Any parameter and/or request body that accepts XML or responses that return XML payloads.',
    url: {
      '3.0': 'https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md#xml-object',
      '3.1': 'https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#xml-object',
    },
  },
};

const README_FEATURE_DOCS: Record<keyof Analysis['readme'], Pick<AnalyzedFeature, 'description' | 'url'>> = {
  'x-default': {
    description:
      'The x-default extension allows you to define static authentication credential defaults for OAuth 2 and API Key security types.',
    url: 'https://docs.readme.com/main/docs/openapi-extensions#authentication-defaults',
  },
  'x-readme.code-samples': {
    description:
      'The x-readme.code-samples extension allows you to custom, create static code samples on your API documentation.',
    url: 'https://docs.readme.com/main/docs/openapi-extensions#custom-code-samples',
  },
  'x-readme.headers': {
    description:
      'The x-readme.headers extension allows you define headers that should always be present on your API or a specific operation, as well as what its value should be.',
    url: 'https://docs.readme.com/main/docs/openapi-extensions#static-headers',
  },
  'x-readme.explorer-enabled': {
    description:
      'The x-readme.explorer-enabled extension allows you to toggle your API documentation being interactive or not.',
    url: 'https://docs.readme.com/main/docs/openapi-extensions#disable-the-api-explorer',
  },
  'x-readme.proxy-enabled': {
    description:
      "The x-readme.proxy-enabled extension allows you to toggle if API requests from API documentation should be routed through ReadMe's CORS Proxy. You should only need to use this if your API does not support CORS.",
    url: 'https://docs.readme.com/main/docs/openapi-extensions#cors-proxy-enabled',
  },
  'x-readme.samples-languages': {
    description:
      'The x-readme.samples-languages extension allows you to toggle what languages are shown by default for code snippets in your API documentation.',
    url: 'https://docs.readme.com/main/docs/openapi-extensions#code-sample-languages',
  },
  'x-readme.samples-enabled': {
    description:
      'The x-readme.samples-enabled extension allowed you to disable code samples on specific endpoints. It is no longer supported and can be safely removed from your API definition.',
    url: 'https://docs.readme.com/main/docs/openapi-extensions#disable-code-examples',
  },
  raw_body: {
    description:
      "The RAW_BODY property allows you to define that a request body should have its payload delivered as a raw string. This legacy feature is specific to our Manual API editor and we don't recommend you use it outside of that context, instead opting for a traditional `type: string, format: blob` schema definition.",
  },
};

/**
 * Analyze a given OpenAPI or Swagger definition for any OpenAPI, JSON Schema, and ReadMe-specific
 * feature uses it may contain.
 *
 */
async function analyzeOas(definition: OASDocument) {
  return analyzer(definition).then((analysis: Analysis) => {
    if (analysis.openapi) {
      Object.entries(OPENAPI_FEATURE_DOCS).forEach(([feature, docs]: [keyof Analysis['openapi'], AnalyzedFeature]) => {
        // eslint-disable-next-line no-param-reassign
        analysis.openapi[feature] = {
          ...analysis.openapi[feature],
          ...docs,
        };
      });
    }

    if (analysis.readme) {
      Object.entries(README_FEATURE_DOCS).forEach(([feature, docs]: [keyof Analysis['readme'], AnalyzedFeature]) => {
        // If this ReadMe feature isn't in our resulted analysis result then it's a deprecated
        // feature that this API definition doesn't contain so we don't need to inform the user of
        // something they neither use, can't use anyways, nor should know about.
        if (!(feature in analysis.readme)) {
          return;
        }

        // eslint-disable-next-line no-param-reassign
        analysis.readme[feature] = {
          ...analysis.readme[feature],
          ...docs,
        };
      });
    }

    return analysis;
  });
}

export function getSupportedFeatures() {
  return [
    // OpenAPI features
    ...Object.keys(OPENAPI_FEATURE_DOCS),

    'readme', // A catch-all for ReadMe features and extensions. Will look for everything.
  ];
}

export default analyzeOas;
