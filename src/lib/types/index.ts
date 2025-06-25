import type { APIv2PageUploadCommands } from '../../index.js';
import type { FromSchema } from 'json-schema-to-ts';

import readmeAPIv2Oas from './openapiDoc.js';

export const categoryUriRegexPattern =
  readmeAPIv2Oas.paths['/branches/{branch}/guides'].post.requestBody.content['application/json'].schema.properties
    .category.properties.uri.pattern;

export const parentUriRegexPattern =
  readmeAPIv2Oas.paths['/branches/{branch}/guides'].post.requestBody.content['application/json'].schema.properties
    .parent.properties.uri.pattern;

type projectSchema =
  (typeof readmeAPIv2Oas)['paths']['/projects/me']['get']['responses']['200']['content']['application/json']['schema'];

type apiKeySchema =
  (typeof readmeAPIv2Oas)['paths']['/projects/{subdomain}/apikeys/{api_key_id}']['get']['responses']['200']['content']['application/json']['schema'];

type apiUploadSingleResponseSchema =
  (typeof readmeAPIv2Oas)['paths']['/branches/{branch}/apis/{filename}']['get']['responses']['200']['content']['application/json']['schema'];

type stagedApiUploadResponseSchema =
  (typeof readmeAPIv2Oas)['paths']['/branches/{branch}/apis']['post']['responses']['202']['content']['application/json']['schema'];

/** Page schemas */
type PageRoute = APIv2PageUploadCommands['route'];

type PageRequestSchemaRaw<T extends PageRoute> = T extends 'custom_pages' | 'guides' | 'reference'
  ? (typeof readmeAPIv2Oas)['paths'][`/branches/{branch}/${T}/{slug}`]['patch']['requestBody']['content']['application/json']['schema']
  : T extends 'changelogs'
    ? (typeof readmeAPIv2Oas)['paths']['/changelogs/{identifier}']['patch']['requestBody']['content']['application/json']['schema']
    : never;

type PageResponseSchemaRaw<T extends PageRoute> = T extends 'custom_pages' | 'guides' | 'reference'
  ? (typeof readmeAPIv2Oas)['paths'][`/branches/{branch}/${T}/{slug}`]['patch']['responses']['200']['content']['application/json']['schema']
  : T extends 'changelogs'
    ? (typeof readmeAPIv2Oas)['paths']['/changelogs/{identifier}']['patch']['responses']['200']['content']['application/json']['schema']
    : never;

/**
 * Derived from our API documentation, this is the schema for the `project` object
 * as we receive it from the ReadMe API.
 */
export type ProjectRepresentation = FromSchema<projectSchema, { keepDefaultedPropertiesOptional: true }>;

/**
 * Derived from our API documentation, this is the schema for the API key object
 * as we receive it from the ReadMe API.
 */
export type APIKeyRepresentation = FromSchema<apiKeySchema, { keepDefaultedPropertiesOptional: true }>;

/**
 * Derived from our API documentation, this is the schema for the API upload response
 * as we receive it from the "Get an API definition" endpoint of the ReadMe API.
 */
export type APIUploadSingleResponseRepresentation = FromSchema<
  apiUploadSingleResponseSchema,
  { keepDefaultedPropertiesOptional: true }
>;

/**
 * Derived from our API documentation, this is the schema for a staged API upload
 * as we receive it from the `POST` and `PATCH` API definition endpoints of the ReadMe API.
 */
export type StagedAPIUploadResponseRepresentation = FromSchema<
  stagedApiUploadResponseSchema,
  { keepDefaultedPropertiesOptional: true }
>;

export type APIUploadStatus = APIUploadSingleResponseRepresentation['data']['upload']['status'];

/**
 * Derived from our API documentation, this is the schema for the page objects
 * as we send them to the ReadMe API.
 *
 * This is only for TypeScript type-checking purposes — we use ajv
 * to validate the user's schema during runtime.
 */
export type PageRequestSchema<T extends PageRoute> = FromSchema<
  PageRequestSchemaRaw<T>,
  { keepDefaultedPropertiesOptional: true }
>;

/**
 * Derived from our API documentation, this is the schema for the page objects
 * as we receive them from the ReadMe API.
 */
export type PageResponseSchema<T extends PageRoute> = FromSchema<
  PageResponseSchemaRaw<T>,
  { keepDefaultedPropertiesOptional: true }
>;
