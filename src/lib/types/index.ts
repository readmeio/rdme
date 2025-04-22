import type { FromSchema } from 'json-schema-to-ts';

import readmeAPIv2Oas from './openapiDoc.js';

export const categoryUriRegexPattern =
  readmeAPIv2Oas.paths['/versions/{version}/guides'].post.requestBody.content['application/json'].schema.properties
    .category.properties.uri.pattern;

export const parentUriRegexPattern =
  readmeAPIv2Oas.paths['/versions/{version}/guides'].post.requestBody.content['application/json'].schema.properties
    .parent.properties.uri.pattern;

type guidesRequestBodySchema =
  (typeof readmeAPIv2Oas)['paths']['/versions/{version}/guides/{slug}']['patch']['requestBody']['content']['application/json']['schema'];

type projectSchema =
  (typeof readmeAPIv2Oas)['paths']['/projects/me']['get']['responses']['200']['content']['application/json']['schema'];

type apiKeySchema =
  (typeof readmeAPIv2Oas)['paths']['/projects/{subdomain}/apikeys/{api_key_id}']['get']['responses']['200']['content']['application/json']['schema'];

/**
 * Derived from our API documentation, this is the schema for the `guides` object
 * as we send it to the ReadMe API.
 *
 * This is only for TypeScript type-checking purposes — we use ajv
 * to validate the user's schema during runtime.
 */
export type GuidesRequestRepresentation = FromSchema<
  guidesRequestBodySchema,
  { keepDefaultedPropertiesOptional: true }
>;

export type ProjectRepresentation = FromSchema<projectSchema, { keepDefaultedPropertiesOptional: true }>;

export type APIKeyRepresentation = FromSchema<apiKeySchema, { keepDefaultedPropertiesOptional: true }>;
