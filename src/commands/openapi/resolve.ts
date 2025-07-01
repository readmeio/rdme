/* eslint-disable no-param-reassign */
import type { OASDocument } from 'oas/types';
import type { OpenAPIV3_1 as OpenAPIV31 } from 'openapi-types';

import fs from 'node:fs';
import path from 'node:path';

import { Flags } from '@oclif/core';
import chalk from 'chalk';
import ora from 'ora';
import prompts from 'prompts';

import analyzeOas from '../../lib/analyzeOas.js';
import BaseCommand from '../../lib/baseCommand.js';
import { specArg, workingDirectoryFlag } from '../../lib/flags.js';
import { oraOptions } from '../../lib/logger.js';
import prepareOas from '../../lib/prepareOas.js';
import promptTerminal from '../../lib/promptWrapper.js';
import { validateFilePath } from '../../lib/validatePromptInput.js';

type Schema = OpenAPIV31.ReferenceObject | OpenAPIV31.SchemaObject;

type SchemaCollection = Record<string, Schema>;

export default class OpenAPIResolveCommand extends BaseCommand<typeof OpenAPIResolveCommand> {
  static summary = 'Resolves circular and recursive references in OpenAPI by replacing them with object schemas.';

  static description =
    'This command provides a workaround for circular or recursive references within OpenAPI definitions so they can render properly in ReadMe. It automatically identifies and replaces these references with simplified object schemas, ensuring compatibility for seamless display in the ReadMe API Reference. As a result, instead of displaying an empty form, as would occur with schemas containing such references, you will receive a flattened representation of the object, showing what the object can potentially contain, including references to itself. Complex circular references may require manual inspection and may not be fully resolved.';

  static args = {
    spec: specArg,
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
    out: Flags.string({ description: 'Output file path to write resolved file to' }),
    workingDirectory: workingDirectoryFlag,
  };

  /**
   * Identifies circular references in the OpenAPI document.
   *
   */
  // eslint-disable-next-line class-methods-use-this
  private async getCircularRefs(
    /** The OpenAPI document to analyze. */
    spec: OASDocument,
  ): Promise<string[]> {
    const analysis = await analyzeOas(spec);
    const circularRefs = analysis.openapi.circularRefs;
    return Array.isArray(circularRefs.locations) ? circularRefs.locations : [];
  }

  /**
   * Replaces a reference in a schema with an object if it's circular or recursive.
   *
   */
  // eslint-disable-next-line class-methods-use-this
  private replaceRefWithObjectProxySchemes(
    /** The schema to process. */
    schema: Schema,
    /** List of circular reference paths. */
    circularRefs: string[],
    /** The name of the schema being processed. */
    schemaName: string,
  ): Schema {
    if ('$ref' in schema) {
      const refSchemaName = schema.$ref.split('/').pop();
      if (!refSchemaName) {
        throw new Error('Invalid $ref: unable to extract schema name.');
      }
      const isCircular = circularRefs.some(refPath => refPath.includes(refSchemaName));
      const isRecursive = schemaName === refSchemaName;

      if (schemaName.includes('Ref') && (isCircular || isRecursive)) {
        return { type: 'object' };
      }
    }

    return schema;
  }

  /**
   * Recursively replaces references in schemas, transforming circular references to objects.
   */
  private replaceRefsInSchema(
    /** The schema to process. */
    schema: Schema,
    /** List of circular reference paths. */
    circularRefs: string[],
    /** The name of the schema being processed. */
    schemaName: string,
  ): void {
    if ('$ref' in schema) {
      return;
    }

    if (schema.type === 'object' && schema.properties) {
      for (const prop of Object.keys(schema.properties)) {
        let property = JSON.parse(JSON.stringify(schema.properties[prop]));
        property = this.replaceRefWithObjectProxySchemes(property, circularRefs, schemaName);
        schema.properties[prop] = property;

        // Handle arrays with item references
        if (property.type === 'array' && property.items) {
          property.items = JSON.parse(JSON.stringify(property.items));
          property.items = this.replaceRefWithObjectProxySchemes(property.items, circularRefs, schemaName);

          this.replaceRefsInSchema(property.items, circularRefs, schemaName);
        }
      }
    }
  }

  /**
   * Replaces circular references within a collection of schemas.
   *
   */
  private replaceCircularRefs(
    /** Collection of schemas to modify. */
    schemas: SchemaCollection,
    /** List of circular reference paths. */
    circularRefs: string[],
  ): void {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    const createdRefs = new Set<string>();

    function replaceRef(schemaName: string, propertyName: string, refSchemaName: string) {
      const schema = schemas[schemaName];
      if ('properties' in schema) {
        schema.properties![propertyName] = { $ref: `#/components/schemas/${refSchemaName}` };
      } else if ('$ref' in schema) {
        schema.$ref = `#/components/schemas/${refSchemaName}`;
      }
    }

    function createRefSchema(originalSchemaName: string, refSchemaName: string) {
      if (!createdRefs.has(refSchemaName) && schemas[originalSchemaName]) {
        const schema = schemas[originalSchemaName];

        if ('properties' in schema) {
          schemas[refSchemaName] = {
            type: 'object',
            properties: { ...schema.properties },
          };
        } else if ('$ref' in schema) {
          schemas[refSchemaName] = {
            $ref: schema.$ref,
          };
        } else {
          throw new Error(`Unsupported schema type detected in: ${originalSchemaName}`);
        }

        self.replaceRefsInSchema(schemas[refSchemaName], circularRefs, refSchemaName);
        createdRefs.add(refSchemaName);
      }
    }

    circularRefs.forEach(refPath => {
      const refParts = refPath.split('/');
      if (refParts.length < 4) {
        throw new Error(`Invalid reference path: ${refPath}`);
      }

      const schemaName = refParts[3];
      const propertyName = refParts[5];
      const schema = schemas[schemaName];

      let property: Schema;

      if ('properties' in schema && schema.properties?.[propertyName]) {
        property = schema.properties[propertyName];
      } else if ('$ref' in schema && schema.$ref) {
        property = { $ref: schema.$ref };
      } else {
        throw new Error(`Property "${propertyName}" is not found or schema is invalid.`);
      }

      if (!schema || !property) {
        throw new Error(`Schema or property not found for path: ${refPath}`);
      }

      if ('$ref' in property) {
        const refSchemaName = property.$ref?.split('/')[3];
        if (refSchemaName) {
          const newRefSchemaName = `${refSchemaName}Ref`;
          if (refSchemaName.includes('Ref')) {
            this.debug(`Skipping proxy schema for ${refSchemaName}.`);
            return;
          }
          replaceRef(schemaName, propertyName, newRefSchemaName);
          createRefSchema(refSchemaName, newRefSchemaName);
          return;
        }

        throw new Error(`Invalid \`$ref\` in property: ${JSON.stringify(property)}`);
      }

      // Handle references within items in an array
      let refSchemaName: string;
      if (
        refParts.length > 6 &&
        refParts[6] === 'items' &&
        property.type === 'array' &&
        property.items &&
        typeof property.items === 'object'
      ) {
        if ('$ref' in property.items) {
          const itemsRefSchemaName = property.items.$ref.split('/')[3];

          if (itemsRefSchemaName) {
            refSchemaName = `${itemsRefSchemaName}Ref`;
            if (itemsRefSchemaName.includes('Ref')) {
              this.debug(`Skipping proxy schema for ${itemsRefSchemaName} in array items.`);
              return;
            }

            property.items = { $ref: `#/components/schemas/${refSchemaName}` };
            createRefSchema(itemsRefSchemaName, refSchemaName);
          }
        }
      }
    });
  }

  /**
   * Replaces all remaining circular references in the schema with `{ type: "object" }`.
   *
   */
  private replaceAllRefsWithObject(
    /** Collection of schemas to modify. */
    schemas: SchemaCollection,
    /** List of circular reference paths. */
    circularRefs: string[],
  ): void {
    circularRefs.forEach(refPath => {
      const refParts = refPath.split('/');
      if (refParts.length < 4) {
        throw new Error(`Invalid reference path: ${refPath}`);
      }

      const schemaName = refParts[3];
      const propertyName = refParts[5];

      let schema = schemas?.[schemaName];
      if (!schema) {
        this.warn(`Schema not found for: ${schemaName}`);
        return;
      }

      if ('properties' in schema && schema.properties && schema.properties[propertyName]) {
        schema.properties[propertyName] = { type: 'object' };
      } else if ('type' in schema && schema.type === 'array' && 'items' in schema && schema.items) {
        schema.items = { type: 'object' };
      } else if ('$ref' in schema && typeof schema.$ref === 'string') {
        schema = { type: 'object' };
      } else {
        throw new Error(`Invalid schema format: ${JSON.stringify(schema)}`);
      }
    });
  }

  /**
   * Resolves circular references in the provided OpenAPI document.
   */
  private async resolveCircularRefs(
    /** The OpenAPI document to analyze. */
    spec: OASDocument,
    /** Collection of schemas to modify. */
    schemas: SchemaCollection,
  ): Promise<void> {
    const initialCircularRefs = await this.getCircularRefs(spec);
    if (!initialCircularRefs.length) {
      throw new Error('The file does not contain circular or recursive references.');
    }

    this.debug(`Found ${initialCircularRefs.length} circular references. Attempting resolution.`);

    this.replaceCircularRefs(schemas, initialCircularRefs);

    let remainingCircularRefs = await this.getCircularRefs(spec);
    let iterationCount = 0;
    const maxIterations = 10;

    while (remainingCircularRefs.length > 0 && iterationCount < maxIterations) {
      this.debug(
        `Iteration ${iterationCount + 1}: Resolving ${remainingCircularRefs.length} remaining circular references.`,
      );
      this.replaceCircularRefs(schemas, remainingCircularRefs);

      // eslint-disable-next-line no-await-in-loop
      remainingCircularRefs = await this.getCircularRefs(spec);
      iterationCount += 1;
    }

    if (remainingCircularRefs.length > 0) {
      this.info('Unresolved circular references remain. These references will be replaced with empty objects.', {
        includeEmojiPrefix: true,
      });
      this.debug(`Remaining circular references: ${JSON.stringify(remainingCircularRefs, null, 2)}`);

      const maxObjectReplacementIterations = 5;
      let objectReplacementIterationCount = 0;

      while (remainingCircularRefs.length > 0 && objectReplacementIterationCount < maxObjectReplacementIterations) {
        this.debug(
          `Object replacement iteration ${objectReplacementIterationCount + 1}: replacing remaining circular references.`,
        );
        this.replaceAllRefsWithObject(schemas, remainingCircularRefs);

        // eslint-disable-next-line no-await-in-loop
        remainingCircularRefs = await this.getCircularRefs(spec);
        this.debug(
          `After iteration ${objectReplacementIterationCount + 1}, remaining circular references: ${remainingCircularRefs.length}`,
        );
        objectReplacementIterationCount += 1;
      }

      if (remainingCircularRefs.length > 0) {
        this.debug(`Final unresolved circular references: ${JSON.stringify(remainingCircularRefs, null, 2)}`);
        throw new Error('Unable to resolve all circular references, even with fallback replacements.');
      } else {
        this.debug('All remaining circular references successfully replaced with empty objects.');
      }
    } else {
      this.debug('All circular references successfully resolved.');
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

    const { preparedSpec, specPath, specType } = await prepareOas(spec, 'openapi resolve');
    if (specType !== 'OpenAPI') {
      throw new Error('Sorry, this command only supports OpenAPI 3.0+ definitions.');
    }

    const parsedSpec: OASDocument = JSON.parse(preparedSpec);
    if (!parsedSpec.components?.schemas) {
      throw new Error('The file does not contain component schemas.');
    }

    const schemas: SchemaCollection = parsedSpec.components?.schemas;

    const spinner = ora({ ...oraOptions() });
    spinner.start('Identifying and resolving circular/recursive references in your API definition...');

    try {
      await this.resolveCircularRefs(parsedSpec, schemas);
      spinner.succeed(`${spinner.text} done! ✅`);
    } catch (err) {
      this.debug(`${err.message}`);
      spinner.fail();
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
    fs.writeFileSync(outputPath, JSON.stringify(parsedSpec, null, 2));
    this.debug('resolved spec saved');

    this.log(chalk.green(`Your API definition has been processed and saved to ${outputPath}!`));
    return { success: true, outputPath };
  }
}
