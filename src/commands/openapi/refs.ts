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
import { workingDirectoryFlag } from '../../lib/flags.js';
import { info, warn, debug } from '../../lib/logger.js';
import prepareOas from '../../lib/prepareOas.js';
import promptTerminal from '../../lib/promptWrapper.js';
import { validateFilePath } from '../../lib/validatePromptInput.js';

type SchemaCollection = Record<string, IJsonSchema>;

export default class OpenAPIRefsCommand extends BaseCommand<typeof OpenAPIRefsCommand> {
  static summary = 'Resolves circular and recursive references in OpenAPI by replacing them with object schemas.';

  static description =
    'This command addresses limitations in ReadMe’s support for circular or recursive references within OpenAPI specifications. It automatically identifies and replaces these references with simplified object schemas, ensuring compatibility for seamless display in the ReadMe platform. As a result, instead of displaying an empty form, as would occur with schemas containing such references, you will receive a flattened representation of the object, showing what the object can potentially contain, including references to itself. Complex circular references may require manual inspection and may not be fully resolved.';

  static args = {
    spec: Args.string({ description: 'A file/URL to your API definition' }),
  };

  static examples = [
    {
      description:
        'This will resolve circular and recursive references in the OpenAPI definition at the given file or URL:',
      command: '<%= config.bin %> <%= command.id %> [url-or-local-path-to-file]',
    },
    {
      description:
        'You can omit the file name and `rdme` will scan your working directory (and any subdirectories) for OpenAPI files. This approach will provide you with CLI prompts, so we do not recommend this technique in CI environments.',
      command: '<%= config.bin %> <%= command.id %>',
    },
    {
      description: 'If you wish to automate this command, you can pass in CLI arguments to bypass the prompts:',
      command: '<%= config.bin %> <%= command.id %> petstore.json --out petstore.openapi.json',
    },
  ];

  static flags = {
    out: Flags.string({ description: 'Output file path to write processed file to' }),
    workingDirectory: workingDirectoryFlag,
  };

  /**
   * Identifies circular references in the OpenAPI document.
   * @returns A list of circular reference paths.
   */
  static async getCircularRefsFromOas(
    /** The OpenAPI document to analyze. */
    document: OASDocument,
  ): Promise<string[]> {
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
   * @returns The modified schema or the original.
   */
  static replaceRefWithObjectProxySchemes(
    /** The schema to process. */
    schema: IJsonSchema,
    /** List of circular reference paths. */
    circularRefs: string[],
    /** The name of the schema being processed. */
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
   */
  static replaceRefsInSchema(
    /** The schema to process. */
    schema: IJsonSchema,
    /** List of circular reference paths. */
    circularRefs: string[],
    /** The name of the schema being processed. */
    schemaName: string,
  ) {
    if (schema.type === 'object' && schema.properties) {
      for (const prop of Object.keys(schema.properties)) {
        let property = JSON.parse(JSON.stringify(schema.properties[prop]));
        property = OpenAPIRefsCommand.replaceRefWithObjectProxySchemes(property, circularRefs, schemaName);
        schema.properties[prop] = property;

        // Handle arrays with item references
        if (property.type === 'array' && property.items) {
          property.items = JSON.parse(JSON.stringify(property.items));
          property.items = OpenAPIRefsCommand.replaceRefWithObjectProxySchemes(
            property.items,
            circularRefs,
            schemaName,
          );
          OpenAPIRefsCommand.replaceRefsInSchema(property.items, circularRefs, schemaName);
        }
      }
    }
  }

  /**
   * Replaces circular references within a collection of schemas.
   */
  static replaceCircularRefs(
    /** Collection of schemas to modify. */
    schemas: SchemaCollection,
    /** List of circular reference paths. */
    circularRefs: string[],
  ): void {
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
        OpenAPIRefsCommand.replaceRefsInSchema(schemas[refSchemaName], circularRefs, refSchemaName);
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
   */
  static replaceAllRefsWithObject(
    /** Collection of schemas to modify. */
    schemas: SchemaCollection,
    /** List of circular reference paths. */
    circularRefs: string[],
  ): void {
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
   */
  static async resolveCircularRefs(
    /** The OpenAPI document to analyze. */
    openApiData: OASDocument,
    /** Collection of schemas to modify. */
    schemas: SchemaCollection,
  ) {
    const initialCircularRefs = await OpenAPIRefsCommand.getCircularRefsFromOas(openApiData);

    if (initialCircularRefs.length === 0) {
      throw new Error('The file does not contain circular or recursive references.');
    }

    debug(`Found ${initialCircularRefs.length} circular references. Attempting resolution.`);

    OpenAPIRefsCommand.replaceCircularRefs(schemas, initialCircularRefs);

    let remainingCircularRefs = await OpenAPIRefsCommand.getCircularRefsFromOas(openApiData);
    let iterationCount = 0;
    const maxIterations = 8;

    while (remainingCircularRefs.length > 0 && iterationCount < maxIterations) {
      debug(
        `Iteration ${iterationCount + 1}: Resolving ${remainingCircularRefs.length} remaining circular references.`,
      );
      OpenAPIRefsCommand.replaceCircularRefs(schemas, remainingCircularRefs);

      // eslint-disable-next-line no-await-in-loop
      remainingCircularRefs = await OpenAPIRefsCommand.getCircularRefsFromOas(openApiData);
      iterationCount += 1;
    }

    if (remainingCircularRefs.length > 0) {
      info(
        'Unresolved circular references remain. These references will be replaced with empty objects for schema display purposes.',
        { includeEmojiPrefix: true },
      );
      debug(`Remaining circular references: ${JSON.stringify(remainingCircularRefs, null, 2)}`);

      const maxObjectReplacementIterations = 5;
      let objectReplacementIterationCount = 0;

      while (remainingCircularRefs.length > 0 && objectReplacementIterationCount < maxObjectReplacementIterations) {
        debug(
          `Object replacement iteration ${objectReplacementIterationCount + 1}: replacing remaining circular references.`,
        );
        OpenAPIRefsCommand.replaceAllRefsWithObject(schemas, remainingCircularRefs);

        // eslint-disable-next-line no-await-in-loop
        remainingCircularRefs = await OpenAPIRefsCommand.getCircularRefsFromOas(openApiData);
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
      await OpenAPIRefsCommand.resolveCircularRefs(openApiData, openApiData.components!.schemas!);
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
