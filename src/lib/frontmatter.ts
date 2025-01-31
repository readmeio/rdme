import type { PageMetadata } from './readPage.js';
import type { CommandsThatSyncMarkdown } from './syncPagePath.js';
import type { ErrorObject } from 'ajv';
import type { SchemaObject } from 'oas/types';

import fs from 'node:fs';

import { Ajv } from 'ajv';
import _addFormats from 'ajv-formats';
import grayMatter from 'gray-matter';

import { cleanAPIv1Headers, readmeAPIv1Fetch } from './readmeAPIFetch.js';
import { readmeAPIv2Oas } from './types.js';

// workaround from here: https://github.com/ajv-validator/ajv-formats/issues/85#issuecomment-2262652443
const addFormats = _addFormats as unknown as typeof _addFormats.default;

interface Mappings {
  categories: Record<string, string>;
  parentPages: Record<string, string>;
}

export const emptyMappings: Mappings = { categories: {}, parentPages: {} };

/**
 * Fetches the category and parent page mappings from the ReadMe API.
 */
export async function fetchMappings(this: CommandsThatSyncMarkdown): Promise<Mappings> {
  const mappings = await readmeAPIv1Fetch('/api/v1/migration', {
    method: 'get',
    headers: cleanAPIv1Headers(this.flags.key, undefined, new Headers({ Accept: 'application/json' })),
  })
    .then(res => {
      if (!res.ok) {
        this.debug(`received the following error when attempting to fetch mappings: ${res.status}`);
        return emptyMappings;
      }
      this.debug('received a successful response when fetching mappings');
      return res.json() as Promise<Mappings>;
    })
    .catch(e => {
      this.debug(`error fetching mappings: ${e}`);
      return emptyMappings;
    });

  return mappings;
}

/**
 * Fetches the schema for the current route from the ReadMe API's OpenAPI description.
 */
export async function fetchSchema(this: CommandsThatSyncMarkdown) {
  const oas = await this.readmeAPIFetch('/openapi.json')
    .then(res => {
      if (!res.ok) {
        this.debug(`received the following error when attempting to fetch the readme OAS: ${res.status}`);
        return readmeAPIv2Oas;
      }
      this.debug('received a successful response when fetching schema');
      return res.json() as Promise<typeof readmeAPIv2Oas>;
    })
    .catch(e => {
      this.debug(`error fetching readme OAS: ${e}`);
      return readmeAPIv2Oas;
    });

  const requestBody = oas.paths?.[`/versions/{version}/${this.route}/{slug}`]?.patch?.requestBody;

  if (requestBody && 'content' in requestBody) {
    return requestBody.content['application/json'].schema as SchemaObject;
  }

  this.debug(`unable to find parse out schema for ${JSON.stringify(oas)}`);
  return readmeAPIv2Oas.paths[`/versions/{version}/${this.route}/{slug}`].patch.requestBody.content['application/json']
    .schema satisfies SchemaObject;
}

/**
 * Validates the front matter data, fixes any issues, and returns the results.
 */
export function fix(
  this: CommandsThatSyncMarkdown,
  /** front matter data to be validated */
  data: PageMetadata['data'],
  /** schema to validate against */
  schema: SchemaObject,
  /**
   * mappings of object IDs to slugs
   * (e.g., category IDs to category URIs)
   */
  mappings: Mappings,
): {
  changeCount: number;
  errors: ErrorObject[];
  hasIssues: boolean;
  unfixableErrors: ErrorObject[];
  updatedData: PageMetadata['data'];
} {
  if (!Object.keys(data).length) {
    this.debug('no front matter attributes found, skipping validation');
    return { changeCount: 0, errors: [], hasIssues: false, unfixableErrors: [], updatedData: data };
  }

  const ajv = new Ajv({ allErrors: true, strictTypes: false, strictTuples: false });

  addFormats(ajv);

  const ajvValidate = ajv.compile(schema);

  ajvValidate(data);

  let errors: ErrorObject[] | undefined;

  if (ajvValidate?.errors) {
    errors = ajvValidate.errors;
    this.debug(`${errors.length} errors found: ${JSON.stringify(errors)}`);

    // if one of the errors is that the category uri doesn't match the pattern,
    // we can ignore it since we normalize it later
    const categoryUriPatternErrorIndex = ajvValidate.errors.findIndex(
      error => error.instancePath === '/category/uri' && error.keyword === 'pattern',
    );

    if (categoryUriPatternErrorIndex >= 0) {
      this.debug('removing category uri pattern error');
      errors.splice(categoryUriPatternErrorIndex, 1);
    }

    // also do the same for the parent uri
    const parentUriPatternErrorIndex = ajvValidate.errors.findIndex(
      error => error.instancePath === '/parent/uri' && error.keyword === 'pattern',
    );

    if (parentUriPatternErrorIndex >= 0) {
      this.debug('removing category uri pattern error');
      errors.splice(parentUriPatternErrorIndex, 1);
    }
  }

  let changeCount = 0;
  const unfixableErrors: ErrorObject[] = [];
  const updatedData = structuredClone(data);

  if (typeof errors === 'undefined' || !errors.length) {
    return { changeCount, errors: [], hasIssues: false, unfixableErrors, updatedData };
  }

  errors.forEach(error => {
    if (error.instancePath === '/category' && error.keyword === 'type') {
      const uri = mappings.categories[data.category as string];
      updatedData.category = {
        uri: uri || `uri-that-does-not-map-to-${data.category}`,
      };
      changeCount += 1;
    } else if (error.keyword === 'additionalProperties') {
      const badKey = error.params.additionalProperty as string;
      const extractedValue = data[badKey];
      if (error.schemaPath === '#/additionalProperties') {
        // if the bad property is at the root level, delete it
        delete updatedData[badKey];
        changeCount += 1;
        if (badKey === 'excerpt') {
          // if the `content` object exists, add to it. otherwise, create it
          if (typeof updatedData.content === 'object' && updatedData.content) {
            (updatedData.content as Record<string, unknown>).excerpt = extractedValue;
          } else {
            updatedData.content = {
              excerpt: extractedValue,
            };
          }
        } else if (badKey === 'categorySlug') {
          updatedData.category = {
            uri: extractedValue,
          };
        } else if (badKey === 'parentDoc') {
          const uri = mappings.parentPages[extractedValue as string];
          updatedData.parent = {
            uri: uri || `uri-that-does-not-map-to-${extractedValue}`,
          };
        } else if (badKey === 'parentDocSlug') {
          updatedData.parent = {
            uri: extractedValue,
          };
        } else if (badKey === 'hidden') {
          updatedData.privacy = { view: extractedValue ? 'anyone_with_link' : 'public' };
        } else if (badKey === 'order') {
          updatedData.position = extractedValue;
        }
      } else {
        unfixableErrors.push(error);
      }
    } else {
      unfixableErrors.push(error);
    }
  });

  return { errors, changeCount, hasIssues: true, unfixableErrors, updatedData };
}

export function writeFixes(
  this: CommandsThatSyncMarkdown,
  /** all metadata for the page that will be written to */
  metadata: PageMetadata,
  /** front matter changes to be applied */
  updatedData: PageMetadata['data'],
) {
  this.debug(`writing fixes to ${metadata.filePath}`);
  const result = grayMatter.stringify(metadata.content, updatedData);
  fs.writeFileSync(metadata.filePath, result, { encoding: 'utf-8' });

  const updatedMetadata = {
    ...metadata,
    data: updatedData,
  };

  return updatedMetadata;
}
