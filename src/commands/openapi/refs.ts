/* eslint-disable no-param-reassign */
import type { OASDocument } from 'oas/types';
import type { IJsonSchema } from 'openapi-types';

import fs from 'node:fs';
import path from 'node:path';

import { Args, Flags } from '@oclif/core';
import chalk from 'chalk';
import prompts from 'prompts';

import analyzeOas from '../../lib/analyzeOas.js';
import BaseCommand from '../../lib/baseCommand.js';
import { titleFlag, workingDirectoryFlag } from '../../lib/flags.js';
import { warn, debug } from '../../lib/logger.js';
import prepareOas from '../../lib/prepareOas.js';
import promptTerminal from '../../lib/promptWrapper.js';
import { validateFilePath } from '../../lib/validatePromptInput.js';

type SchemaCollection = Record<string, IJsonSchema>;

export default class OpenAPISolvingCircularityAndRecursiveness extends BaseCommand<
  typeof OpenAPISolvingCircularityAndRecursiveness
> {
  static description =
    'Resolves circular and recursive references in OpenAPI by replacing them with object schemas. Not all circular references can be resolved automatically.';

  static args = {
    spec: Args.string({ description: 'A file/URL to your API definition' }),
  };

  static flags = {
    out: Flags.string({ description: 'Output file path to write processed file to' }),
    title: titleFlag,
    workingDirectory: workingDirectoryFlag,
  };

  /**
   * Identifies circular references in the OpenAPI document.
   * @param {OASDocument} document - The OpenAPI document to analyze.
   * @returns {Promise<string[]>} A list of circular reference paths.
   */
  static async getCircularRefsFromOas(document: OASDocument): Promise<string[]> {
    try {
      const analysis = await analyzeOas(document);
      const circularRefs = analysis.openapi.circularRefs;
      return Array.isArray(circularRefs.locations) ? circularRefs.locations : [];
    } catch (error) {
      return [`Error analyzing OpenAPI document: ${error}`];
    }
  }

  /**
   * Replaces a reference in a schema with an object if it's circular or recursive.
   * @param {IJsonSchema} schema - The schema to process.
   * @param {string[]} circularRefs - List of circular reference paths.
   * @param {string} schemaName - The name of the schema being processed.
   * @returns {IJsonSchema} The modified schema or the original.
   */
  static replaceRefWithObjectProxySchemes(
    schema: IJsonSchema,
    circularRefs: string[],
    schemaName: string,
  ): IJsonSchema {
    if (schema.$ref) {
      const refSchemaName = schema.$ref.split('/').pop() as string;
      const isCircular = circularRefs.some(refPath => refPath.includes(refSchemaName));
      const isRecursive = schemaName === refSchemaName;

      if (schemaName.includes('Ref') && (isCircular || isRecursive)) {
        return { type: 'object' } as IJsonSchema;
      }
    }

    return schema;
  }

  /**
   * Recursively replaces references in schemas, transforming circular references to objects.
   * @param {IJsonSchema} schema - The schema to process.
   * @param {string[]} circularRefs - List of circular reference paths.
   * @param {string} schemaName - The name of the schema being processed.
   */
  static replaceRefsInSchema(schema: IJsonSchema, circularRefs: string[], schemaName: string) {
    if (schema.type === 'object' && schema.properties) {
      for (const prop of Object.keys(schema.properties)) {
        let property = JSON.parse(JSON.stringify(schema.properties[prop]));
        property = OpenAPISolvingCircularityAndRecursiveness.replaceRefWithObjectProxySchemes(
          property,
          circularRefs,
          schemaName,
        );
        schema.properties[prop] = property;

        // Handle arrays with item references
        if (property.type === 'array' && property.items) {
          property.items = JSON.parse(JSON.stringify(property.items));
          property.items = OpenAPISolvingCircularityAndRecursiveness.replaceRefWithObjectProxySchemes(
            property.items,
            circularRefs,
            schemaName,
          );
          OpenAPISolvingCircularityAndRecursiveness.replaceRefsInSchema(property.items, circularRefs, schemaName);
        }
      }
    }
  }

  /**
   * Replaces circular references within a collection of schemas.
   * @param {SchemaCollection} schemas - Collection of schemas to modify.
   * @param {string[]} circularRefs - List of circular reference paths.
   */
  static replaceCircularRefs(schemas: SchemaCollection, circularRefs: string[]): void {
    const createdRefs = new Set<string>();

    function replaceRef(schemaName: string, propertyName: string, refSchemaName: string) {
      schemas[schemaName]!.properties![propertyName] = { $ref: `#/components/schemas/${refSchemaName}` } as IJsonSchema;
    }

    function createRefSchema(originalSchemaName: string, refSchemaName: string) {
      if (!createdRefs.has(refSchemaName) && schemas[originalSchemaName]) {
        schemas[refSchemaName] = {
          type: 'object',
          properties: { ...schemas[originalSchemaName].properties },
        } as IJsonSchema;
        OpenAPISolvingCircularityAndRecursiveness.replaceRefsInSchema(
          schemas[refSchemaName],
          circularRefs,
          refSchemaName,
        );
        createdRefs.add(refSchemaName);
      }
    }

    circularRefs.forEach(refPath => {
      const refParts = refPath.split('/');
      if (refParts.length < 6) {
        throw new Error(`Invalid reference path: ${refPath}`);
      }

      const schemaName = refParts[3];
      const propertyName = refParts[5];
      const schema = schemas[schemaName];
      const property = schema?.properties?.[propertyName];

      if (!schema || !property) {
        throw new Error(`Schema or property not found for path: ${refPath}`);
      }

      // Handle references within items in an array
      let refSchemaName: string | undefined;
      if (
        refParts.length > 6 &&
        refParts[6] === 'items' &&
        property.type === 'array' &&
        property.items &&
        typeof property.items === 'object'
      ) {
        const itemsRefSchemaName = (property.items as IJsonSchema).$ref?.split('/')[3];
        if (itemsRefSchemaName) {
          refSchemaName = `${itemsRefSchemaName}Ref`;
          if (itemsRefSchemaName.includes('Ref')) {
            debug(`Skipping proxy schema for ${itemsRefSchemaName} in array items.`);
            return;
          }
          property.items = { $ref: `#/components/schemas/${refSchemaName}` } as IJsonSchema;
          createRefSchema(itemsRefSchemaName, refSchemaName);
        }
      } else {
        // Handle direct reference
        refSchemaName = property.$ref?.split('/')[3];
        if (refSchemaName) {
          const newRefSchemaName = `${refSchemaName}Ref`;
          if (refSchemaName.includes('Ref')) {
            debug(`Skipping proxy schema for ${refSchemaName}.`);
            return;
          }
          replaceRef(schemaName, propertyName, newRefSchemaName);
          createRefSchema(refSchemaName, newRefSchemaName);
        }
      }
    });
  }

  /**
   * Replaces all remaining circular references ($ref) in the schema with { type: 'object' }.
   * @param {SchemaCollection} schemas - Collection of schemas to modify.
   * @param {string[]} circularRefs - List of circular reference paths.
   */
  static replaceAllRefsWithObject(schemas: SchemaCollection, circularRefs: string[]): void {
    circularRefs.forEach(refPath => {
      const refParts = refPath.split('/');
      if (refParts.length < 6) {
        throw new Error(`Invalid reference path: ${refPath}`);
      }

      const schemaName = refParts[3];
      const propertyName = refParts[5];

      const schema = schemas?.[schemaName];
      if (!schema) {
        warn(`Schema not found for: ${schemaName}`);
        return;
      }

      if (schema.properties && schema.properties[propertyName]) {
        schema.properties[propertyName] = { type: 'object' };
      } else if (schema.type === 'array' && schema.items) {
        schema.items = { type: 'object' };
      }
    });
  }

  /**
   * Resolves circular references in the provided OpenAPI document.
   * @param {OASDocument} openApiData - The OpenAPI document to process.
   * @param {SchemaCollection} schemas - Collection of schemas to modify.
   * @returns {Promise<void>}
   */
  static async resolveCircularRefs(openApiData: OASDocument, schemas: SchemaCollection) {
    const initialCircularRefs = await OpenAPISolvingCircularityAndRecursiveness.getCircularRefsFromOas(openApiData);

    if (initialCircularRefs.length === 0) {
      throw new Error('The file does not contain circular or recursive references.');
    }

    debug(`Found ${initialCircularRefs.length} circular references. Attempting resolution.`);

    OpenAPISolvingCircularityAndRecursiveness.replaceCircularRefs(schemas, initialCircularRefs);

    let remainingCircularRefs = await OpenAPISolvingCircularityAndRecursiveness.getCircularRefsFromOas(openApiData);
    let iterationCount = 0;
    const maxIterations = 8;

    while (remainingCircularRefs.length > 0 && iterationCount < maxIterations) {
      debug(
        `Iteration ${iterationCount + 1}: Resolving ${remainingCircularRefs.length} remaining circular references.`,
      );
      OpenAPISolvingCircularityAndRecursiveness.replaceCircularRefs(schemas, remainingCircularRefs);

      // eslint-disable-next-line no-await-in-loop
      remainingCircularRefs = await OpenAPISolvingCircularityAndRecursiveness.getCircularRefsFromOas(openApiData);
      iterationCount += 1;
    }

    if (remainingCircularRefs.length > 0) {
      // eslint-disable-next-line no-console
      console.info(
        'ℹ️  Unresolved circular references remain. These references will be replaced with empty objects for schema display purposes.',
      );
      debug(`Remaining circular references: ${JSON.stringify(remainingCircularRefs, null, 2)}`);

      const maxObjectReplacementIterations = 5;
      let objectReplacementIterationCount = 0;

      while (remainingCircularRefs.length > 0 && objectReplacementIterationCount < maxObjectReplacementIterations) {
        debug(
          `Object replacement iteration ${objectReplacementIterationCount + 1}: replacing remaining circular references.`,
        );
        OpenAPISolvingCircularityAndRecursiveness.replaceAllRefsWithObject(schemas, remainingCircularRefs);

        // eslint-disable-next-line no-await-in-loop
        remainingCircularRefs = await OpenAPISolvingCircularityAndRecursiveness.getCircularRefsFromOas(openApiData);
        debug(
          `After iteration ${objectReplacementIterationCount + 1}, remaining circular references: ${remainingCircularRefs.length}`,
        );
        objectReplacementIterationCount += 1;
      }

      if (remainingCircularRefs.length > 0) {
        debug(`Final unresolved circular references: ${JSON.stringify(remainingCircularRefs, null, 2)}`);
        throw new Error('Unable to resolve all circular references, even with fallback replacements.');
      } else {
        debug('All remaining circular references successfully replaced with empty objects.');
      }
    } else {
      debug('All circular references successfully resolved.');
    }
  }

  async run() {
    const { spec } = this.args;
    const { out, workingDirectory } = this.flags;

    if (workingDirectory) {
      const previousWorkingDirectory = process.cwd();
      process.chdir(workingDirectory);
      this.debug(`Switching working directory from ${previousWorkingDirectory} to ${process.cwd()}`);
    }

    const { preparedSpec, specPath } = await prepareOas(spec, 'openapi:refs', { convertToLatest: true });
    const openApiData = JSON.parse(preparedSpec);

    try {
      await OpenAPISolvingCircularityAndRecursiveness.resolveCircularRefs(
        openApiData,
        openApiData.components!.schemas!,
      );
    } catch (err) {
      this.debug(`${err.message}`);
      throw err;
    }

    prompts.override({ outputPath: out });
    const promptResults = await promptTerminal([
      {
        type: 'text',
        name: 'outputPath',
        message: 'Enter the path to save your processed API definition to:',
        initial: () => `${path.basename(specPath).split(path.extname(specPath))[0]}.openapi.json`,
        validate: value => validateFilePath(value),
      },
    ]);

    const outputPath = promptResults.outputPath;
    this.debug(`Saving processed spec to ${outputPath}...`);
    fs.writeFileSync(outputPath, JSON.stringify(openApiData, null, 2));
    this.debug('Processed spec saved successfully.');

    return Promise.resolve(chalk.green(`Your API definition has been processed and saved to ${outputPath}!`));
  }
}
