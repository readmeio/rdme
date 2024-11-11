/* eslint-disable no-param-reassign */
import type { ZeroAuthCommandOptions } from '../../lib/baseCommand.js';
import type { OASDocument } from 'oas/types';
import type { IJsonSchema } from 'openapi-types';

import fs from 'node:fs';

// eslint-disable-next-line import/no-extraneous-dependencies
import jsYaml from 'js-yaml';

import analyzeOas from '../../lib/analyzeOas.js';
import Command, { CommandCategories } from '../../lib/baseCommand.js';

interface Options {
  spec?: string;
}

type SchemaCollection = Record<string, IJsonSchema>;

class OpenAPISolvingCircularityAndRecursiveness extends Command {
  constructor() {
    super();
    this.command = 'openapi:refs';
    this.usage = 'openapi:refs [file]';
    this.description = 'The script resolves circular and recursive references in OpenAPI by replacing them with object schemas. However, not all circular references can be resolved. You can run the openapi:inspect command to identify which references remain unresolved.';
    this.cmdCategory = CommandCategories.APIS;

    this.hiddenArgs = ['spec'];
    this.args = [
      {
        name: 'spec',
        type: String,
        defaultOption: true,
      },
    ];
  }

  /**
   * Reads and parses an OpenAPI file (JSON or YAML).
   * @param {string} filePath - The file path to read.
   * @returns {any} The parsed content of the file.
   */
  static readOpenApiFile(filePath: string) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return filePath.endsWith('.json') ? JSON.parse(fileContent) : jsYaml.load(fileContent);
  }

  /**
   * Writes OpenAPI data to a file (JSON or YAML).
   * @param {string} filePath - The file path to write to.
   * @param {OASDocument} data - The data to be written.
   */
  static writeOpenApiFile(filePath: string, data: OASDocument) {
    const content = filePath.endsWith('.json')
      ? JSON.stringify(data, null, 2)
      : jsYaml.dump(data, { noRefs: true }); // Disables YAML anchors
    fs.writeFileSync(filePath, content, 'utf8');
  }

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
  static replaceRefWithObject(schema: IJsonSchema, circularRefs: string[], schemaName: string): IJsonSchema {
    if (schema.$ref) {
      const refSchemaName = schema.$ref.split('/').pop() as string;
      const isCircular = circularRefs.some((refPath) => refPath.includes(refSchemaName));
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
  static replaceReferencesInSchema(schema: IJsonSchema, circularRefs: string[], schemaName: string) {
    if (schema.type === 'object' && schema.properties) {
      for (const prop of Object.keys(schema.properties)) {
        let property = JSON.parse(JSON.stringify(schema.properties[prop]));
        property = OpenAPISolvingCircularityAndRecursiveness.replaceRefWithObject(property, circularRefs, schemaName);
        schema.properties[prop] = property;

        // Handle arrays with item references
        if (property.type === 'array' && property.items) {
          property.items = JSON.parse(JSON.stringify(property.items));
          property.items = OpenAPISolvingCircularityAndRecursiveness.replaceRefWithObject(property.items, circularRefs, schemaName);
          OpenAPISolvingCircularityAndRecursiveness.replaceReferencesInSchema(property.items, circularRefs, schemaName);
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
        OpenAPISolvingCircularityAndRecursiveness.replaceReferencesInSchema(schemas[refSchemaName], circularRefs, refSchemaName);
        createdRefs.add(refSchemaName);
      }
    }

    circularRefs.forEach((refPath) => {
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
      if (refParts.length > 6 && refParts[6] === 'items' && property.type === 'array' && property.items && typeof property.items === 'object') {
        const itemsRefSchemaName = (property.items as IJsonSchema).$ref?.split('/')[3];
        if (itemsRefSchemaName) {
          refSchemaName = `${itemsRefSchemaName}Ref`;
          property.items = { $ref: `#/components/schemas/${refSchemaName}` } as IJsonSchema;
          createRefSchema(itemsRefSchemaName, refSchemaName);
        }
      } else {
        // Handle direct reference
        refSchemaName = property.$ref?.split('/')[3];
        if (refSchemaName) {
          const newRefSchemaName = `${refSchemaName}Ref`;
          replaceRef(schemaName, propertyName, newRefSchemaName);
          createRefSchema(refSchemaName, newRefSchemaName);
        }
      }
    });
  }


  /**
   * The main execution method for the command.
   * @param {ZeroAuthCommandOptions<Options>} opts - Command options.
   * @returns {Promise<string>} Result message.
   */
  async run(opts: ZeroAuthCommandOptions<Options>): Promise<string> {
    await super.run(opts);
    const { spec } = opts;
    if (!spec) {
      return 'File path is required.';
    }

    const openApiData = OpenAPISolvingCircularityAndRecursiveness.readOpenApiFile(spec);
    const circularRefs = await OpenAPISolvingCircularityAndRecursiveness.getCircularRefsFromOas(openApiData);

    if (circularRefs.length === 0) {
      return 'The file does not contain circular or recursive references.';
    }

    if (openApiData.components?.schemas && circularRefs.length > 0) {
      OpenAPISolvingCircularityAndRecursiveness.replaceCircularRefs(openApiData.components.schemas, circularRefs);

      let remainingCircularRefs = await OpenAPISolvingCircularityAndRecursiveness.getCircularRefsFromOas(openApiData);
      let iterationCount = 0;

      while (remainingCircularRefs.length > 0 && iterationCount < 5) {
        OpenAPISolvingCircularityAndRecursiveness.replaceCircularRefs(openApiData.components.schemas, remainingCircularRefs);
        remainingCircularRefs = remainingCircularRefs.length > 0 ? [] : remainingCircularRefs;
        iterationCount += 1;
      }

      if (iterationCount >= 5) {
        return 'Maximum iteration limit reached. Some circular references may remain unresolved.';
      }
    }

    OpenAPISolvingCircularityAndRecursiveness.writeOpenApiFile(spec, openApiData);
    return `Processed and updated ${spec}`;
  }

}

export default OpenAPISolvingCircularityAndRecursiveness;
