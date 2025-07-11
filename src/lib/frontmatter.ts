import type { ErrorObject } from 'ajv';
import type { SchemaObject } from 'oas/types';
import type { APIv2PageCommands } from '../index.js';
import type { Mappings } from './readmeAPIFetch.js';
import type { PageMetadata } from './readPage.js';

import fs from 'node:fs';
import path from 'node:path';

import { Ajv } from 'ajv';
import _addFormats from 'ajv-formats';
import grayMatter from 'gray-matter';

// workaround from here: https://github.com/ajv-validator/ajv-formats/issues/85#issuecomment-2262652443
const addFormats = _addFormats as unknown as typeof _addFormats.default;

/**
 * Validates the frontmatter data, fixes any issues, and returns the results.
 */
export function fix(
  this: APIv2PageCommands,
  /** frontmatter data to be validated */
  data: PageMetadata['data'],
  /** schema to validate against */
  schema: SchemaObject,
  /**
   * mappings of object IDs to slugs
   * (e.g., category IDs to category URIs)
   */
  mappings: Mappings,
): {
  fixableErrorCount: number;
  errors: ErrorObject[];
  hasIssues: boolean;
  unfixableErrors: ErrorObject[];
  updatedData: PageMetadata['data'];
} {
  if (!Object.keys(data).length) {
    this.debug('no frontmatter attributes found, skipping validation');
    return { fixableErrorCount: 0, errors: [], hasIssues: false, unfixableErrors: [], updatedData: data };
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

  let fixableErrorCount = 0;
  const unfixableErrors: ErrorObject[] = [];
  const updatedData = structuredClone(data);

  if (typeof errors === 'undefined' || !errors.length) {
    return { errors: [], fixableErrorCount, hasIssues: false, unfixableErrors, updatedData };
  }

  errors.forEach(error => {
    if (
      error.instancePath === '/category' &&
      error.keyword === 'type' &&
      (this.route === 'guides' || this.route === 'reference')
    ) {
      const uri = mappings.categories[data.category as string];
      updatedData.category = {
        uri: uri || `uri-that-does-not-map-to-${data.category}`,
      };
      fixableErrorCount += 1;
    } else if (error.keyword === 'additionalProperties') {
      const badKey = error.params.additionalProperty as string;
      const extractedValue = data[badKey];
      if (error.schemaPath === '#/additionalProperties') {
        // if the bad property is at the root level, delete it
        delete updatedData[badKey];
        fixableErrorCount += 1;

        // hidden is the only attribute that is present in all page types
        if (badKey === 'hidden') {
          const hidden = typeof extractedValue === 'boolean' ? extractedValue : extractedValue === 'true';
          updatedData.privacy = { view: hidden ? 'anyone_with_link' : 'public' };
        } else {
          switch (this.route) {
            case 'custom_pages':
              switch (badKey) {
                case 'htmlmode':
                  // if the `content` object exists, add to it. otherwise, create it
                  if (typeof updatedData.content === 'object' && updatedData.content) {
                    (updatedData.content as Record<string, unknown>).type = extractedValue ? 'html' : 'markdown';
                  } else {
                    updatedData.content = { type: extractedValue ? 'html' : 'markdown' };
                  }
                  break;
                case 'fullscreen':
                  updatedData.appearance = { fullscreen: extractedValue };
                  break;
                default:
                  break;
              }
              break;
            case 'guides':
            case 'reference':
              switch (badKey) {
                case 'excerpt':
                  // if the `content` object exists, add to it. otherwise, create it
                  if (typeof updatedData.content === 'object' && updatedData.content) {
                    (updatedData.content as Record<string, unknown>).excerpt = extractedValue;
                  } else {
                    updatedData.content = { excerpt: extractedValue };
                  }
                  break;
                case 'categorySlug':
                  updatedData.category = { uri: extractedValue };
                  break;
                case 'parentDoc':
                  {
                    const uri = mappings.parentPages[extractedValue as string];
                    if (uri) {
                      updatedData.parent = { uri };
                    }
                  }
                  break;
                case 'parentDocSlug':
                  updatedData.parent = { uri: extractedValue };
                  break;
                case 'order':
                  updatedData.position = extractedValue;
                  break;
                default:
                  break;
              }
              break;
            default:
              break;
          }
        }
      } else {
        unfixableErrors.push(error);
      }
    } else {
      unfixableErrors.push(error);
    }
  });

  return { errors, fixableErrorCount, hasIssues: true, unfixableErrors, updatedData };
}

export function writeFixes(
  this: APIv2PageCommands,
  /** all metadata for the page that will be written to */
  metadata: PageMetadata,
  /** frontmatter changes to be applied */
  updatedData: PageMetadata['data'],
  /** output directory to write to */
  outputDirArg?: string,
) {
  const result = grayMatter.stringify(metadata.content, updatedData);
  const outputPath = outputDirArg ? path.join(outputDirArg, metadata.filePath) : metadata.filePath;
  this.debug(`writing fixes to ${outputPath}`);
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  fs.writeFileSync(outputPath, result, { encoding: 'utf-8' });

  const updatedMetadata = {
    ...metadata,
    data: updatedData,
  };

  return updatedMetadata;
}
