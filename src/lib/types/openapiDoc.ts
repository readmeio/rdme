import type { OASDocument } from 'oas/types';

/**
 * This is a snapshot of the OpenAPI description for ReadMe APIv2.
 *
 * This is used both for typechecking as well as for runtime validation.
 * We use  ajv to validate the user data against schemas in this document.
 *
 * @see {@link https://docs.readme.com/main/openapi/readme-api-v2-beta.json}
 */
const document = {
  openapi: '3.1.0',
  info: {
    description: 'Create beautiful product and API documentation with our developer friendly platform.',
    version: '2.0.0-beta',
    title: 'ReadMe API v2 🦉 (BETA)',
    // @ts-expect-error custom extension
    'x-readme-deploy': '5.336.0',
    termsOfService: 'https://readme.com/tos',
    contact: {
      name: 'API Support',
      url: 'https://docs.readme.com/main/docs/need-more-support',
      email: 'support@readme.io',
    },
  },
  components: {
    securitySchemes: {
      bearer: {
        type: 'http',
        scheme: 'bearer',
        description: 'A bearer token that will be supplied within an `Authentication` header as `bearer <token>`.',
      },
    },
    schemas: {},
  },
  paths: {
    '/projects/{subdomain}/apikeys': {
      post: {
        operationId: 'createAPIKey',
        summary: 'Create an API key',
        tags: ['API Keys'],
        description:
          "Create an API key for your ReadMe project.\n\n>🚧 ReadMe's API v2 is currently in beta.\n >This API and its documentation are a work in progress. While we don't expect any major breaking changes, you may encounter occasional issues as we work toward a stable release. Make sure to [check out our API migration guide](https://docs.readme.com/main/reference/api-migration-guide), and [feel free to reach out](mailto:support@readme.io) if you have any questions or feedback!",
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { label: { allOf: [{ type: 'string' }, { type: 'string', minLength: 1 }] } },
                required: ['label'],
                additionalProperties: false,
              },
            },
          },
          required: true,
        },
        parameters: [
          {
            schema: { type: 'string', pattern: '(me|[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*)', maxLength: 30 },
            in: 'path',
            name: 'subdomain',
            required: true,
            description: 'The subdomain of your project.',
          },
        ],
        responses: {
          '201': {
            description: 'Created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        token: { type: 'string', pattern: 'rdme_\\w+' },
                        label: { type: 'string', nullable: true },
                        last_accessed_on: {
                          type: 'string',
                          format: 'date-time',
                          nullable: true,
                          description: 'An ISO 8601 formatted date for when the API key was last accessed.',
                        },
                        created_at: {
                          type: 'string',
                          format: 'date-time',
                          description: 'An ISO 8601 formatted date for when the API key was created.',
                        },
                        uri: {
                          type: 'string',
                          pattern: '\\/projects\\/(me|[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*)\\/apikeys\\/[a-f\\d]{24}',
                        },
                      },
                      required: ['token', 'label', 'last_accessed_on', 'created_at', 'uri'],
                      additionalProperties: false,
                    },
                  },
                  required: ['data'],
                  additionalProperties: false,
                },
              },
            },
          },
        },
      },
      get: {
        operationId: 'getAPIKeys',
        summary: 'Get your API keys',
        tags: ['API Keys'],
        description:
          "Get the API keys for your ReadMe project.\n\n>🚧 ReadMe's API v2 is currently in beta.\n >This API and its documentation are a work in progress. While we don't expect any major breaking changes, you may encounter occasional issues as we work toward a stable release. Make sure to [check out our API migration guide](https://docs.readme.com/main/reference/api-migration-guide), and [feel free to reach out](mailto:support@readme.io) if you have any questions or feedback!",
        parameters: [
          {
            schema: { type: 'number', minimum: 1, default: 1 },
            in: 'query',
            name: 'page',
            required: false,
            description: 'Used to specify further pages (starts at 1).',
          },
          {
            schema: { type: 'number', minimum: 1, maximum: 100, default: 10 },
            in: 'query',
            name: 'per_page',
            required: false,
            description: 'Number of items to include in pagination (up to 100, defaults to 10).',
          },
          {
            schema: { type: 'string', pattern: '(me|[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*)', maxLength: 30 },
            in: 'path',
            name: 'subdomain',
            required: true,
            description: 'The subdomain of your project.',
          },
        ],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    total: { type: 'number' },
                    page: { type: 'number' },
                    per_page: { type: 'number' },
                    paging: {
                      type: 'object',
                      properties: {
                        next: { type: 'string', nullable: true },
                        previous: { type: 'string', nullable: true },
                        first: { type: 'string', nullable: true },
                        last: { type: 'string', nullable: true },
                      },
                      required: ['next', 'previous', 'first', 'last'],
                      additionalProperties: false,
                    },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          token: { type: 'string', pattern: 'rdme_\\w+' },
                          label: { type: 'string', nullable: true },
                          last_accessed_on: {
                            type: 'string',
                            format: 'date-time',
                            nullable: true,
                            description: 'An ISO 8601 formatted date for when the API key was last accessed.',
                          },
                          created_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'An ISO 8601 formatted date for when the API key was created.',
                          },
                          uri: {
                            type: 'string',
                            pattern: '\\/projects\\/(me|[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*)\\/apikeys\\/[a-f\\d]{24}',
                          },
                        },
                        required: ['token', 'label', 'last_accessed_on', 'created_at', 'uri'],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ['total', 'page', 'per_page', 'paging', 'data'],
                  additionalProperties: false,
                },
              },
            },
          },
        },
      },
    },
    '/projects/{subdomain}/apikeys/{api_key_id}': {
      delete: {
        operationId: 'deleteAPIKey',
        summary: 'Delete an API key',
        tags: ['API Keys'],
        description:
          "Delete an API key from your ReadMe project.\n\n>🚧 ReadMe's API v2 is currently in beta.\n >This API and its documentation are a work in progress. While we don't expect any major breaking changes, you may encounter occasional issues as we work toward a stable release. Make sure to [check out our API migration guide](https://docs.readme.com/main/reference/api-migration-guide), and [feel free to reach out](mailto:support@readme.io) if you have any questions or feedback!",
        parameters: [
          {
            schema: { type: 'string', pattern: '[a-f\\d]{24}' },
            in: 'path',
            name: 'api_key_id',
            required: true,
            description: 'The unique identifier for your API key.',
          },
          {
            schema: { type: 'string', pattern: '(me|[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*)', maxLength: 30 },
            in: 'path',
            name: 'subdomain',
            required: true,
            description: 'The subdomain of your project.',
          },
        ],
        responses: { '204': { description: 'No Content' } },
      },
      get: {
        operationId: 'getAPIKey',
        summary: 'Get an API key',
        tags: ['API Keys'],
        description:
          "Get an API key for your ReadMe project.\n\n>🚧 ReadMe's API v2 is currently in beta.\n >This API and its documentation are a work in progress. While we don't expect any major breaking changes, you may encounter occasional issues as we work toward a stable release. Make sure to [check out our API migration guide](https://docs.readme.com/main/reference/api-migration-guide), and [feel free to reach out](mailto:support@readme.io) if you have any questions or feedback!",
        parameters: [
          {
            schema: { type: 'string', pattern: '[a-f\\d]{24}' },
            in: 'path',
            name: 'api_key_id',
            required: true,
            description: 'The unique identifier for your API key.',
          },
          {
            schema: { type: 'string', pattern: '(me|[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*)', maxLength: 30 },
            in: 'path',
            name: 'subdomain',
            required: true,
            description: 'The subdomain of your project.',
          },
        ],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        token: { type: 'string', pattern: 'rdme_\\w+' },
                        label: { type: 'string', nullable: true },
                        last_accessed_on: {
                          type: 'string',
                          format: 'date-time',
                          nullable: true,
                          description: 'An ISO 8601 formatted date for when the API key was last accessed.',
                        },
                        created_at: {
                          type: 'string',
                          format: 'date-time',
                          description: 'An ISO 8601 formatted date for when the API key was created.',
                        },
                        uri: {
                          type: 'string',
                          pattern: '\\/projects\\/(me|[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*)\\/apikeys\\/[a-f\\d]{24}',
                        },
                      },
                      required: ['token', 'label', 'last_accessed_on', 'created_at', 'uri'],
                      additionalProperties: false,
                    },
                  },
                  required: ['data'],
                  additionalProperties: false,
                },
              },
            },
          },
        },
      },
      patch: {
        operationId: 'updateAPIKey',
        summary: 'Update an API key',
        tags: ['API Keys'],
        description:
          "Update an API key on your ReadMe project.\n\n>🚧 ReadMe's API v2 is currently in beta.\n >This API and its documentation are a work in progress. While we don't expect any major breaking changes, you may encounter occasional issues as we work toward a stable release. Make sure to [check out our API migration guide](https://docs.readme.com/main/reference/api-migration-guide), and [feel free to reach out](mailto:support@readme.io) if you have any questions or feedback!",
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { label: { allOf: [{ type: 'string' }, { type: 'string', minLength: 1 }] } },
                required: ['label'],
                additionalProperties: false,
              },
            },
          },
          required: true,
        },
        parameters: [
          {
            schema: { type: 'string', pattern: '[a-f\\d]{24}' },
            in: 'path',
            name: 'api_key_id',
            required: true,
            description: 'The unique identifier for your API key.',
          },
          {
            schema: { type: 'string', pattern: '(me|[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*)', maxLength: 30 },
            in: 'path',
            name: 'subdomain',
            required: true,
            description: 'The subdomain of your project.',
          },
        ],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        token: { type: 'string', pattern: 'rdme_\\w+' },
                        label: { type: 'string', nullable: true },
                        last_accessed_on: {
                          type: 'string',
                          format: 'date-time',
                          nullable: true,
                          description: 'An ISO 8601 formatted date for when the API key was last accessed.',
                        },
                        created_at: {
                          type: 'string',
                          format: 'date-time',
                          description: 'An ISO 8601 formatted date for when the API key was created.',
                        },
                        uri: {
                          type: 'string',
                          pattern: '\\/projects\\/(me|[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*)\\/apikeys\\/[a-f\\d]{24}',
                        },
                      },
                      required: ['token', 'label', 'last_accessed_on', 'created_at', 'uri'],
                      additionalProperties: false,
                    },
                  },
                  required: ['data'],
                  additionalProperties: false,
                },
              },
            },
          },
        },
      },
    },
    '/versions/{version}/apis': {
      get: {
        operationId: 'getAPIs',
        summary: 'Get all API definitions',
        tags: ['APIs'],
        description:
          "Get all API definitions from your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).\n\n>🚧 ReadMe's API v2 is currently in beta.\n >This API and its documentation are a work in progress. While we don't expect any major breaking changes, you may encounter occasional issues as we work toward a stable release. Make sure to [check out our API migration guide](https://docs.readme.com/main/reference/api-migration-guide), and [feel free to reach out](mailto:support@readme.io) if you have any questions or feedback!",
        parameters: [
          {
            schema: { type: 'string', pattern: 'stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?' },
            in: 'path',
            name: 'version',
            required: true,
            description: 'Project version number or `stable` for your stable project version.',
          },
        ],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    total: { type: 'number' },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          created_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'An ISO 8601 formatted date for when the API definition was created.',
                          },
                          filename: {
                            type: 'string',
                            description: 'This is the unique identifier, its filename, for the API definition.',
                          },
                          source: {
                            type: 'object',
                            properties: {
                              current: {
                                type: 'string',
                                enum: [
                                  'api',
                                  'apidesigner',
                                  'apieditor',
                                  'bidi',
                                  'form',
                                  'postman',
                                  'rdme',
                                  'rdme_github',
                                  'url',
                                ],
                              },
                              original: {
                                type: 'string',
                                enum: [
                                  'api',
                                  'apidesigner',
                                  'apieditor',
                                  'bidi',
                                  'form',
                                  'postman',
                                  'rdme',
                                  'rdme_github',
                                  'url',
                                ],
                              },
                            },
                            required: ['current', 'original'],
                            additionalProperties: false,
                            description: 'The sources by which this API definition was ingested.',
                          },
                          type: {
                            type: 'string',
                            enum: ['openapi', 'postman', 'swagger', 'unknown'],
                            description:
                              'The type of API definition. This will be `unknown` if the API definition has either not yet been processed or failed with validation errors.',
                          },
                          updated_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'An ISO 8601 formatted date for when the API definition was last updated.',
                          },
                          upload: {
                            type: 'object',
                            properties: {
                              status: {
                                type: 'string',
                                enum: ['pending', 'failed', 'done', 'pending_update', 'failed_update'],
                                description: 'The status of the API definition upload.',
                              },
                              reason: {
                                type: 'string',
                                nullable: true,
                                description: 'The reason for the upload failure if it failed.',
                              },
                              warnings: {
                                type: 'string',
                                nullable: true,
                                description:
                                  'Any fixable warnings that may exist within the API definition if the upload was ingested without errors.',
                              },
                            },
                            required: ['status', 'reason', 'warnings'],
                            additionalProperties: false,
                          },
                          uri: {
                            type: 'string',
                            pattern:
                              '\\/versions\\/(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)\\/apis\\/((([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+.(json|yaml|yml)))',
                            description: 'A URI to the API definition resource.',
                          },
                        },
                        required: ['created_at', 'filename', 'source', 'type', 'updated_at', 'upload', 'uri'],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ['total', 'data'],
                  additionalProperties: false,
                },
              },
            },
          },
        },
      },
      post: {
        operationId: 'createAPI',
        summary: 'Create an API definition',
        tags: ['APIs'],
        description:
          "Create an API definition in the API Reference section of your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).\n\n>🚧 ReadMe's API v2 is currently in beta.\n >This API and its documentation are a work in progress. While we don't expect any major breaking changes, you may encounter occasional issues as we work toward a stable release. Make sure to [check out our API migration guide](https://docs.readme.com/main/reference/api-migration-guide), and [feel free to reach out](mailto:support@readme.io) if you have any questions or feedback!",
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  schema: { description: 'The API definition.' },
                  upload_source: {
                    default: 'form',
                    description: 'The source that the API definition is being uploaded through.',
                  },
                  url: { description: 'The URL where the API definition is hosted.' },
                },
                additionalProperties: false,
              },
            },
          },
        },
        parameters: [
          {
            schema: { type: 'string', pattern: 'stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?' },
            in: 'path',
            name: 'version',
            required: true,
            description: 'Project version number or `stable` for your stable project version.',
          },
        ],
        responses: {
          '202': {
            description: 'Accepted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        upload: {
                          type: 'object',
                          properties: {
                            status: {
                              type: 'string',
                              enum: ['pending', 'failed', 'done', 'pending_update', 'failed_update'],
                              description: 'The status of the API definition upload.',
                            },
                          },
                          required: ['status'],
                          additionalProperties: false,
                        },
                        uri: {
                          type: 'string',
                          pattern:
                            '\\/versions\\/(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)\\/apis\\/((([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+.(json|yaml|yml)))',
                          description: 'A URI to the API definition resource.',
                        },
                      },
                      required: ['upload', 'uri'],
                      additionalProperties: false,
                    },
                  },
                  required: ['data'],
                  additionalProperties: false,
                },
              },
            },
          },
        },
      },
    },
    '/versions/{version}/apis/{filename}': {
      get: {
        operationId: 'getAPI',
        summary: 'Get an API definition',
        tags: ['APIs'],
        description:
          "Get an API definition from your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).\n\n>🚧 ReadMe's API v2 is currently in beta.\n >This API and its documentation are a work in progress. While we don't expect any major breaking changes, you may encounter occasional issues as we work toward a stable release. Make sure to [check out our API migration guide](https://docs.readme.com/main/reference/api-migration-guide), and [feel free to reach out](mailto:support@readme.io) if you have any questions or feedback!",
        parameters: [
          {
            schema: { type: 'string', pattern: '(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+.(json|yaml|yml))' },
            in: 'path',
            name: 'filename',
            required: true,
            description: 'The filename of the API definition to retrieve.',
          },
          {
            schema: { type: 'string', pattern: 'stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?' },
            in: 'path',
            name: 'version',
            required: true,
            description: 'Project version number or `stable` for your stable project version.',
          },
        ],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        created_at: {
                          type: 'string',
                          format: 'date-time',
                          description: 'An ISO 8601 formatted date for when the API definition was created.',
                        },
                        filename: {
                          type: 'string',
                          description: 'This is the unique identifier, its filename, for the API definition.',
                        },
                        source: {
                          type: 'object',
                          properties: {
                            current: {
                              type: 'string',
                              enum: [
                                'api',
                                'apidesigner',
                                'apieditor',
                                'bidi',
                                'form',
                                'postman',
                                'rdme',
                                'rdme_github',
                                'url',
                              ],
                            },
                            original: {
                              type: 'string',
                              enum: [
                                'api',
                                'apidesigner',
                                'apieditor',
                                'bidi',
                                'form',
                                'postman',
                                'rdme',
                                'rdme_github',
                                'url',
                              ],
                            },
                          },
                          required: ['current', 'original'],
                          additionalProperties: false,
                          description: 'The sources by which this API definition was ingested.',
                        },
                        type: {
                          type: 'string',
                          enum: ['openapi', 'postman', 'swagger', 'unknown'],
                          description:
                            'The type of API definition. This will be `unknown` if the API definition has either not yet been processed or failed with validation errors.',
                        },
                        updated_at: {
                          type: 'string',
                          format: 'date-time',
                          description: 'An ISO 8601 formatted date for when the API definition was last updated.',
                        },
                        upload: {
                          type: 'object',
                          properties: {
                            status: {
                              type: 'string',
                              enum: ['pending', 'failed', 'done', 'pending_update', 'failed_update'],
                              description: 'The status of the API definition upload.',
                            },
                            reason: {
                              type: 'string',
                              nullable: true,
                              description: 'The reason for the upload failure if it failed.',
                            },
                            warnings: {
                              type: 'string',
                              nullable: true,
                              description:
                                'Any fixable warnings that may exist within the API definition if the upload was ingested without errors.',
                            },
                          },
                          required: ['status', 'reason', 'warnings'],
                          additionalProperties: false,
                        },
                        uri: {
                          type: 'string',
                          pattern:
                            '\\/versions\\/(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)\\/apis\\/((([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+.(json|yaml|yml)))',
                          description: 'A URI to the API definition resource.',
                        },
                        schema: { type: 'object', additionalProperties: {}, description: 'The API schema.' },
                      },
                      required: ['created_at', 'filename', 'source', 'type', 'updated_at', 'upload', 'uri', 'schema'],
                      additionalProperties: false,
                    },
                  },
                  required: ['data'],
                  additionalProperties: false,
                },
              },
            },
          },
        },
      },
      delete: {
        operationId: 'deleteAPI',
        summary: 'Delete an API definition',
        tags: ['APIs'],
        description:
          "Delete an API definition from the API Reference section of your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).\n\n>🚧 ReadMe's API v2 is currently in beta.\n >This API and its documentation are a work in progress. While we don't expect any major breaking changes, you may encounter occasional issues as we work toward a stable release. Make sure to [check out our API migration guide](https://docs.readme.com/main/reference/api-migration-guide), and [feel free to reach out](mailto:support@readme.io) if you have any questions or feedback!",
        parameters: [
          {
            schema: { type: 'string', pattern: '(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+.(json|yaml|yml))' },
            in: 'path',
            name: 'filename',
            required: true,
            description: 'The filename of the API definition to retrieve.',
          },
          {
            schema: { type: 'string', pattern: 'stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?' },
            in: 'path',
            name: 'version',
            required: true,
            description: 'Project version number or `stable` for your stable project version.',
          },
        ],
        responses: { '204': { description: 'No Content' } },
      },
      put: {
        operationId: 'updateAPI',
        summary: 'Update an API definition',
        tags: ['APIs'],
        description:
          "Updates an API definition in the API Reference section of your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).\n\n>🚧 ReadMe's API v2 is currently in beta.\n >This API and its documentation are a work in progress. While we don't expect any major breaking changes, you may encounter occasional issues as we work toward a stable release. Make sure to [check out our API migration guide](https://docs.readme.com/main/reference/api-migration-guide), and [feel free to reach out](mailto:support@readme.io) if you have any questions or feedback!",
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  schema: { description: 'The API definition.' },
                  upload_source: {
                    default: 'form',
                    description: 'The source that the API definition is being uploaded through.',
                  },
                  url: { description: 'The URL where the API definition is hosted.' },
                },
                additionalProperties: false,
              },
            },
          },
        },
        parameters: [
          {
            schema: { type: 'string', pattern: '(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+.(json|yaml|yml))' },
            in: 'path',
            name: 'filename',
            required: true,
            description: 'The filename of the API definition to retrieve.',
          },
          {
            schema: { type: 'string', pattern: 'stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?' },
            in: 'path',
            name: 'version',
            required: true,
            description: 'Project version number or `stable` for your stable project version.',
          },
        ],
        responses: {
          '202': {
            description: 'Accepted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        upload: {
                          type: 'object',
                          properties: {
                            status: {
                              type: 'string',
                              enum: ['pending', 'failed', 'done', 'pending_update', 'failed_update'],
                              description: 'The status of the API definition upload.',
                            },
                          },
                          required: ['status'],
                          additionalProperties: false,
                        },
                        uri: {
                          type: 'string',
                          pattern:
                            '\\/versions\\/(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)\\/apis\\/((([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+.(json|yaml|yml)))',
                          description: 'A URI to the API definition resource.',
                        },
                      },
                      required: ['upload', 'uri'],
                      additionalProperties: false,
                    },
                  },
                  required: ['data'],
                  additionalProperties: false,
                },
              },
            },
          },
        },
      },
    },
    '/versions/{version}/categories': {
      post: {
        operationId: 'createCategory',
        summary: 'Create a category',
        tags: ['Categories'],
        description:
          "Create a category in your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).\n\n>🚧 ReadMe's API v2 is currently in beta.\n >This API and its documentation are a work in progress. While we don't expect any major breaking changes, you may encounter occasional issues as we work toward a stable release. Make sure to [check out our API migration guide](https://docs.readme.com/main/reference/api-migration-guide), and [feel free to reach out](mailto:support@readme.io) if you have any questions or feedback!",
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string', description: "The category's name." },
                  section: {
                    type: 'string',
                    enum: ['guide', 'reference'],
                    default: 'guide',
                    description: 'The section of your documentation where the category resides.',
                  },
                },
                required: ['title'],
                additionalProperties: false,
              },
            },
          },
          required: true,
        },
        parameters: [
          {
            schema: { type: 'string', pattern: 'stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?' },
            in: 'path',
            name: 'version',
            required: true,
            description: 'Project version number or `stable` for your stable project version.',
          },
        ],
        responses: {
          '201': {
            description: 'Created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        title: { type: 'string', description: "The category's name." },
                        section: {
                          type: 'string',
                          enum: ['guide', 'reference'],
                          default: 'guide',
                          description: 'The section of your documentation where the category resides.',
                        },
                        links: {
                          type: 'object',
                          properties: {
                            project: {
                              type: 'string',
                              pattern: '\\/projects\\/(me|[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*)',
                              description: 'A URI to the project that this category belongs to.',
                            },
                          },
                          required: ['project'],
                          additionalProperties: false,
                        },
                        uri: {
                          type: 'string',
                          pattern:
                            '\\/versions\\/(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)\\/categories\\/(guides|reference)\\/((.*))',
                          description: 'A URI to the category resource.',
                        },
                      },
                      required: ['title', 'links', 'uri'],
                      additionalProperties: false,
                    },
                  },
                  required: ['data'],
                  additionalProperties: false,
                },
              },
            },
          },
        },
      },
    },
    '/versions/{version}/categories/{section}/{title}': {
      delete: {
        operationId: 'deleteCategory',
        summary: 'Delete a category',
        tags: ['Categories'],
        description:
          "Delete a category from your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).\n\n>🚧 ReadMe's API v2 is currently in beta.\n >This API and its documentation are a work in progress. While we don't expect any major breaking changes, you may encounter occasional issues as we work toward a stable release. Make sure to [check out our API migration guide](https://docs.readme.com/main/reference/api-migration-guide), and [feel free to reach out](mailto:support@readme.io) if you have any questions or feedback!",
        parameters: [
          {
            schema: { type: 'string', enum: ['guides', 'reference'], default: 'guides' },
            in: 'path',
            name: 'section',
            required: true,
            description: 'The section of your documentation where the category resides.',
          },
          {
            schema: { type: 'string' },
            in: 'path',
            name: 'title',
            required: true,
            description: "The category's name.",
          },
          {
            schema: { type: 'string', pattern: 'stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?' },
            in: 'path',
            name: 'version',
            required: true,
            description: 'Project version number or `stable` for your stable project version.',
          },
        ],
        responses: { '204': { description: 'No Content' } },
      },
      patch: {
        operationId: 'updateCategory',
        summary: 'Update a category',
        tags: ['Categories'],
        description:
          "Update an existing category in your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).\n\n>🚧 ReadMe's API v2 is currently in beta.\n >This API and its documentation are a work in progress. While we don't expect any major breaking changes, you may encounter occasional issues as we work toward a stable release. Make sure to [check out our API migration guide](https://docs.readme.com/main/reference/api-migration-guide), and [feel free to reach out](mailto:support@readme.io) if you have any questions or feedback!",
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string', description: "The category's name." },
                  section: {
                    type: 'string',
                    enum: ['guide', 'reference'],
                    default: 'guide',
                    description: 'The section of your documentation where the category resides.',
                  },
                  position: { type: 'number', description: "The position of the category in your project's sidebar." },
                },
                additionalProperties: false,
              },
            },
          },
        },
        parameters: [
          {
            schema: { type: 'string', enum: ['guides', 'reference'], default: 'guides' },
            in: 'path',
            name: 'section',
            required: true,
            description: 'The section of your documentation where the category resides.',
          },
          {
            schema: { type: 'string' },
            in: 'path',
            name: 'title',
            required: true,
            description: "The category's name.",
          },
          {
            schema: { type: 'string', pattern: 'stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?' },
            in: 'path',
            name: 'version',
            required: true,
            description: 'Project version number or `stable` for your stable project version.',
          },
        ],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        title: { type: 'string', description: "The category's name." },
                        section: {
                          type: 'string',
                          enum: ['guide', 'reference'],
                          default: 'guide',
                          description: 'The section of your documentation where the category resides.',
                        },
                        links: {
                          type: 'object',
                          properties: {
                            project: {
                              type: 'string',
                              pattern: '\\/projects\\/(me|[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*)',
                              description: 'A URI to the project that this category belongs to.',
                            },
                          },
                          required: ['project'],
                          additionalProperties: false,
                        },
                        uri: {
                          type: 'string',
                          pattern:
                            '\\/versions\\/(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)\\/categories\\/(guides|reference)\\/((.*))',
                          description: 'A URI to the category resource.',
                        },
                      },
                      required: ['title', 'links', 'uri'],
                      additionalProperties: false,
                    },
                  },
                  required: ['data'],
                  additionalProperties: false,
                },
              },
            },
          },
        },
      },
    },
    '/changelogs': {
      get: {
        operationId: 'getChangelogs',
        summary: 'Get all changelog entries',
        tags: ['Changelog'],
        description:
          "Get all changelog entries from your ReadMe project.\n\n>🚧 ReadMe's API v2 is currently in beta.\n >This API and its documentation are a work in progress. While we don't expect any major breaking changes, you may encounter occasional issues as we work toward a stable release. Make sure to [check out our API migration guide](https://docs.readme.com/main/reference/api-migration-guide), and [feel free to reach out](mailto:support@readme.io) if you have any questions or feedback!",
        parameters: [
          {
            schema: { type: 'number', minimum: 1, default: 1 },
            in: 'query',
            name: 'page',
            required: false,
            description: 'Used to specify further pages (starts at 1).',
          },
          {
            schema: { type: 'number', minimum: 1, maximum: 100, default: 10 },
            in: 'query',
            name: 'per_page',
            required: false,
            description: 'Number of items to include in pagination (up to 100, defaults to 10).',
          },
          {
            schema: { type: 'string', enum: ['public', 'anyone_with_link', 'all'], default: 'all' },
            in: 'query',
            name: 'visibility',
            required: false,
            description:
              'The visibility setting (`privacy.view`) for the changelog entries you wish to retrieve. Defaults to `all`.',
          },
        ],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    total: { type: 'number' },
                    page: { type: 'number' },
                    per_page: { type: 'number' },
                    paging: {
                      type: 'object',
                      properties: {
                        next: { type: 'string', nullable: true },
                        previous: { type: 'string', nullable: true },
                        first: { type: 'string', nullable: true },
                        last: { type: 'string', nullable: true },
                      },
                      required: ['next', 'previous', 'first', 'last'],
                      additionalProperties: false,
                    },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          author: {
                            type: 'object',
                            properties: {
                              id: { type: 'string', nullable: true, description: 'User ID of the changelog author.' },
                              name: {
                                type: 'string',
                                nullable: true,
                                description: 'Full name of the user who created the changelog.',
                              },
                            },
                            required: ['id', 'name'],
                            additionalProperties: false,
                          },
                          content: {
                            type: 'object',
                            properties: { body: { type: 'string', nullable: true } },
                            required: ['body'],
                            additionalProperties: false,
                          },
                          created_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'An ISO 8601 formatted date for when the changelog was created.',
                          },
                          metadata: {
                            type: 'object',
                            properties: {
                              description: { type: 'string', nullable: true },
                              image: {
                                type: 'object',
                                properties: {
                                  uri: {
                                    type: 'string',
                                    pattern: '\\/images\\/([a-f\\d]{24})',
                                    nullable: true,
                                    description:
                                      'A URI to the `getImages` endpoint for this image. If the is a legacy image then this `uri` will be `null`. And if you wish to delete this image then you should set this to `null`.',
                                  },
                                  url: { type: 'string', format: 'uri', nullable: true },
                                },
                                required: ['uri', 'url'],
                                additionalProperties: false,
                              },
                              keywords: {
                                type: 'string',
                                nullable: true,
                                description:
                                  'A comma-separated list of keywords to place into your changelog metadata.',
                              },
                              title: { type: 'string', nullable: true },
                            },
                            required: ['description', 'image', 'keywords', 'title'],
                            additionalProperties: false,
                          },
                          privacy: {
                            type: 'object',
                            properties: {
                              view: {
                                type: 'string',
                                enum: ['public', 'anyone_with_link'],
                                default: 'anyone_with_link',
                                description: 'The visibility of this changelog.',
                              },
                            },
                            additionalProperties: false,
                          },
                          slug: { type: 'string' },
                          title: { type: 'string' },
                          type: {
                            type: 'string',
                            enum: ['none', 'added', 'fixed', 'improved', 'deprecated', 'removed'],
                            default: 'none',
                            description: 'The type of changelog that this is.',
                          },
                          links: {
                            type: 'object',
                            properties: {
                              project: {
                                type: 'string',
                                pattern: '\\/projects\\/(me|[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*)',
                                description: 'A URI to the project that this changelog belongs to.',
                              },
                            },
                            required: ['project'],
                            additionalProperties: false,
                          },
                          updated_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'An ISO 8601 formatted date for when the changelog was updated.',
                          },
                          uri: {
                            type: 'string',
                            pattern: '\\/changelogs\\/([a-f\\d]{24}|([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                          },
                        },
                        required: [
                          'author',
                          'content',
                          'created_at',
                          'metadata',
                          'privacy',
                          'slug',
                          'title',
                          'links',
                          'updated_at',
                          'uri',
                        ],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ['total', 'page', 'per_page', 'paging', 'data'],
                  additionalProperties: false,
                },
              },
            },
          },
        },
      },
    },
    '/changelogs/{identifier}': {
      get: {
        operationId: 'getChangelog',
        summary: 'Get a changelog entry',
        tags: ['Changelog'],
        description:
          "Get a changelog entry from your ReadMe project.\n\n>🚧 ReadMe's API v2 is currently in beta.\n >This API and its documentation are a work in progress. While we don't expect any major breaking changes, you may encounter occasional issues as we work toward a stable release. Make sure to [check out our API migration guide](https://docs.readme.com/main/reference/api-migration-guide), and [feel free to reach out](mailto:support@readme.io) if you have any questions or feedback!",
        parameters: [
          {
            schema: {
              anyOf: [
                { type: 'string', pattern: '[a-f\\d]{24}', description: 'A unique identifier for the resource.' },
                {
                  type: 'string',
                  pattern: '([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+',
                  description: 'A URL-safe representation of the resource.',
                },
              ],
            },
            in: 'path',
            name: 'identifier',
            required: true,
          },
        ],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        author: {
                          type: 'object',
                          properties: {
                            id: { type: 'string', nullable: true, description: 'User ID of the changelog author.' },
                            name: {
                              type: 'string',
                              nullable: true,
                              description: 'Full name of the user who created the changelog.',
                            },
                          },
                          required: ['id', 'name'],
                          additionalProperties: false,
                        },
                        content: {
                          type: 'object',
                          properties: { body: { type: 'string', nullable: true } },
                          required: ['body'],
                          additionalProperties: false,
                        },
                        created_at: {
                          type: 'string',
                          format: 'date-time',
                          description: 'An ISO 8601 formatted date for when the changelog was created.',
                        },
                        metadata: {
                          type: 'object',
                          properties: {
                            description: { type: 'string', nullable: true },
                            image: {
                              type: 'object',
                              properties: {
                                uri: {
                                  type: 'string',
                                  pattern: '\\/images\\/([a-f\\d]{24})',
                                  nullable: true,
                                  description:
                                    'A URI to the `getImages` endpoint for this image. If the is a legacy image then this `uri` will be `null`. And if you wish to delete this image then you should set this to `null`.',
                                },
                                url: { type: 'string', format: 'uri', nullable: true },
                              },
                              required: ['uri', 'url'],
                              additionalProperties: false,
                            },
                            keywords: {
                              type: 'string',
                              nullable: true,
                              description: 'A comma-separated list of keywords to place into your changelog metadata.',
                            },
                            title: { type: 'string', nullable: true },
                          },
                          required: ['description', 'image', 'keywords', 'title'],
                          additionalProperties: false,
                        },
                        privacy: {
                          type: 'object',
                          properties: {
                            view: {
                              type: 'string',
                              enum: ['public', 'anyone_with_link'],
                              default: 'anyone_with_link',
                              description: 'The visibility of this changelog.',
                            },
                          },
                          additionalProperties: false,
                        },
                        slug: { type: 'string' },
                        title: { type: 'string' },
                        type: {
                          type: 'string',
                          enum: ['none', 'added', 'fixed', 'improved', 'deprecated', 'removed'],
                          default: 'none',
                          description: 'The type of changelog that this is.',
                        },
                        links: {
                          type: 'object',
                          properties: {
                            project: {
                              type: 'string',
                              pattern: '\\/projects\\/(me|[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*)',
                              description: 'A URI to the project that this changelog belongs to.',
                            },
                          },
                          required: ['project'],
                          additionalProperties: false,
                        },
                        updated_at: {
                          type: 'string',
                          format: 'date-time',
                          description: 'An ISO 8601 formatted date for when the changelog was updated.',
                        },
                        uri: {
                          type: 'string',
                          pattern: '\\/changelogs\\/([a-f\\d]{24}|([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                        },
                      },
                      required: [
                        'author',
                        'content',
                        'created_at',
                        'metadata',
                        'privacy',
                        'slug',
                        'title',
                        'links',
                        'updated_at',
                        'uri',
                      ],
                      additionalProperties: false,
                    },
                  },
                  required: ['data'],
                  additionalProperties: false,
                },
              },
            },
          },
        },
      },
    },
    '/versions/{version}/custom_pages': {
      post: {
        operationId: 'createCustomPage',
        summary: 'Create a custom page',
        tags: ['Custom Pages'],
        description:
          "Create a custom page in your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).\n\n>🚧 ReadMe's API v2 is currently in beta.\n >This API and its documentation are a work in progress. While we don't expect any major breaking changes, you may encounter occasional issues as we work toward a stable release. Make sure to [check out our API migration guide](https://docs.readme.com/main/reference/api-migration-guide), and [feel free to reach out](mailto:support@readme.io) if you have any questions or feedback!",
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  appearance: {
                    type: 'object',
                    properties: {
                      fullscreen: {
                        type: 'boolean',
                        default: false,
                        description: 'Whether a html custom page is fullscreen or not.',
                      },
                    },
                    additionalProperties: false,
                  },
                  content: {
                    type: 'object',
                    properties: {
                      body: { type: 'string', nullable: true },
                      type: {
                        type: 'string',
                        enum: ['markdown', 'html'],
                        default: 'markdown',
                        description: 'The type of content contained in this custom page.',
                      },
                    },
                    additionalProperties: false,
                  },
                  metadata: {
                    type: 'object',
                    properties: {
                      description: { type: 'string', nullable: true },
                      image: {
                        type: 'object',
                        properties: {
                          uri: { type: 'string', pattern: '\\/images\\/([a-f\\d]{24})', nullable: true },
                          url: { type: 'string', format: 'uri', nullable: true },
                        },
                        additionalProperties: false,
                      },
                      keywords: { type: 'string', nullable: true },
                      title: { type: 'string', nullable: true },
                    },
                    additionalProperties: false,
                  },
                  privacy: {
                    type: 'object',
                    properties: {
                      view: {
                        type: 'string',
                        enum: ['public', 'anyone_with_link'],
                        default: 'anyone_with_link',
                        description: 'The visibility of this custom page.',
                      },
                    },
                    additionalProperties: false,
                  },
                  slug: { type: 'string', pattern: '([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+' },
                  title: { type: 'string', nullable: true },
                },
                required: ['title'],
                additionalProperties: false,
              },
            },
          },
          required: true,
        },
        parameters: [
          {
            schema: { type: 'string', pattern: 'stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?' },
            in: 'path',
            name: 'version',
            required: true,
            description: 'Project version number or `stable` for your stable project version.',
          },
        ],
        responses: {
          '201': {
            description: 'Created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        appearance: {
                          type: 'object',
                          properties: {
                            fullscreen: {
                              type: 'boolean',
                              default: false,
                              description: 'Whether a html custom page is fullscreen or not.',
                            },
                          },
                          additionalProperties: false,
                        },
                        content: {
                          type: 'object',
                          properties: {
                            body: { type: 'string', nullable: true },
                            type: {
                              type: 'string',
                              enum: ['markdown', 'html'],
                              default: 'markdown',
                              description: 'The type of content contained in this custom page.',
                            },
                          },
                          required: ['body'],
                          additionalProperties: false,
                        },
                        metadata: {
                          type: 'object',
                          properties: {
                            description: { type: 'string', nullable: true },
                            image: {
                              type: 'object',
                              properties: {
                                uri: {
                                  type: 'string',
                                  pattern: '\\/images\\/([a-f\\d]{24})',
                                  nullable: true,
                                  description:
                                    'A URI to the `getImages` endpoint for this image. If the is a legacy image then this `uri` will be `null`. And if you wish to delete this image then you should set this to `null`.',
                                },
                                url: { type: 'string', format: 'uri', nullable: true },
                              },
                              required: ['uri', 'url'],
                              additionalProperties: false,
                            },
                            keywords: {
                              type: 'string',
                              nullable: true,
                              description:
                                'A comma-separated list of keywords to place into your custom page metadata.',
                            },
                            title: { type: 'string', nullable: true },
                          },
                          required: ['description', 'image', 'keywords', 'title'],
                          additionalProperties: false,
                        },
                        privacy: {
                          type: 'object',
                          properties: {
                            view: {
                              type: 'string',
                              enum: ['public', 'anyone_with_link'],
                              default: 'anyone_with_link',
                              description: 'The visibility of this custom page.',
                            },
                          },
                          additionalProperties: false,
                        },
                        slug: { type: 'string', pattern: '([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+' },
                        title: { type: 'string', nullable: true },
                        links: {
                          type: 'object',
                          properties: {
                            project: {
                              type: 'string',
                              pattern: '\\/projects\\/(me|[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*)',
                              description: 'A URI to the project resource.',
                            },
                          },
                          required: ['project'],
                          additionalProperties: false,
                        },
                        updated_at: {
                          type: 'string',
                          format: 'date-time',
                          description: 'An ISO 8601 formatted date for when the custom page was updated.',
                          nullable: true,
                        },
                        uri: {
                          type: 'string',
                          pattern:
                            '\\/versions\\/(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)\\/custom_pages\\/([a-f\\d]{24}|([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                        },
                      },
                      required: [
                        'appearance',
                        'content',
                        'metadata',
                        'privacy',
                        'slug',
                        'title',
                        'links',
                        'updated_at',
                        'uri',
                      ],
                      additionalProperties: false,
                    },
                  },
                  required: ['data'],
                  additionalProperties: false,
                },
              },
            },
          },
        },
      },
      get: {
        operationId: 'getCustomPages',
        summary: 'Get all custom pages',
        tags: ['Custom Pages'],
        description:
          "Get all custom pages from your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).\n\n>🚧 ReadMe's API v2 is currently in beta.\n >This API and its documentation are a work in progress. While we don't expect any major breaking changes, you may encounter occasional issues as we work toward a stable release. Make sure to [check out our API migration guide](https://docs.readme.com/main/reference/api-migration-guide), and [feel free to reach out](mailto:support@readme.io) if you have any questions or feedback!",
        parameters: [
          {
            schema: { type: 'string', pattern: 'stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?' },
            in: 'path',
            name: 'version',
            required: true,
            description: 'Project version number or `stable` for your stable project version.',
          },
        ],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    total: { type: 'number' },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          appearance: {
                            type: 'object',
                            properties: {
                              fullscreen: {
                                type: 'boolean',
                                default: false,
                                description: 'Whether a html custom page is fullscreen or not.',
                              },
                            },
                            additionalProperties: false,
                          },
                          content: {
                            type: 'object',
                            properties: {
                              body: { type: 'string', nullable: true },
                              type: {
                                type: 'string',
                                enum: ['markdown', 'html'],
                                default: 'markdown',
                                description: 'The type of content contained in this custom page.',
                              },
                            },
                            required: ['body'],
                            additionalProperties: false,
                          },
                          metadata: {
                            type: 'object',
                            properties: {
                              description: { type: 'string', nullable: true },
                              image: {
                                type: 'object',
                                properties: {
                                  uri: {
                                    type: 'string',
                                    pattern: '\\/images\\/([a-f\\d]{24})',
                                    nullable: true,
                                    description:
                                      'A URI to the `getImages` endpoint for this image. If the is a legacy image then this `uri` will be `null`. And if you wish to delete this image then you should set this to `null`.',
                                  },
                                  url: { type: 'string', format: 'uri', nullable: true },
                                },
                                required: ['uri', 'url'],
                                additionalProperties: false,
                              },
                              keywords: {
                                type: 'string',
                                nullable: true,
                                description:
                                  'A comma-separated list of keywords to place into your custom page metadata.',
                              },
                              title: { type: 'string', nullable: true },
                            },
                            required: ['description', 'image', 'keywords', 'title'],
                            additionalProperties: false,
                          },
                          privacy: {
                            type: 'object',
                            properties: {
                              view: {
                                type: 'string',
                                enum: ['public', 'anyone_with_link'],
                                default: 'anyone_with_link',
                                description: 'The visibility of this custom page.',
                              },
                            },
                            additionalProperties: false,
                          },
                          slug: { type: 'string', pattern: '([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+' },
                          title: { type: 'string', nullable: true },
                          links: {
                            type: 'object',
                            properties: {
                              project: {
                                type: 'string',
                                pattern: '\\/projects\\/(me|[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*)',
                                description: 'A URI to the project resource.',
                              },
                            },
                            required: ['project'],
                            additionalProperties: false,
                          },
                          updated_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'An ISO 8601 formatted date for when the custom page was updated.',
                            nullable: true,
                          },
                          uri: {
                            type: 'string',
                            pattern:
                              '\\/versions\\/(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)\\/custom_pages\\/([a-f\\d]{24}|([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                          },
                        },
                        required: [
                          'appearance',
                          'content',
                          'metadata',
                          'privacy',
                          'slug',
                          'title',
                          'links',
                          'updated_at',
                          'uri',
                        ],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ['total', 'data'],
                  additionalProperties: false,
                },
              },
            },
          },
        },
      },
    },
    '/versions/{version}/custom_pages/{slug}': {
      get: {
        operationId: 'getCustomPage',
        summary: 'Get a custom page',
        tags: ['Custom Pages'],
        description:
          "Get a custom page from your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).\n\n>🚧 ReadMe's API v2 is currently in beta.\n >This API and its documentation are a work in progress. While we don't expect any major breaking changes, you may encounter occasional issues as we work toward a stable release. Make sure to [check out our API migration guide](https://docs.readme.com/main/reference/api-migration-guide), and [feel free to reach out](mailto:support@readme.io) if you have any questions or feedback!",
        parameters: [
          {
            schema: { type: 'string', pattern: 'stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?' },
            in: 'path',
            name: 'version',
            required: true,
            description: 'Project version number or `stable` for your stable project version.',
          },
          {
            schema: { type: 'string', pattern: '([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+' },
            in: 'path',
            name: 'slug',
            required: true,
            description: 'A URL-safe representation of the resource.',
          },
        ],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        appearance: {
                          type: 'object',
                          properties: {
                            fullscreen: {
                              type: 'boolean',
                              default: false,
                              description: 'Whether a html custom page is fullscreen or not.',
                            },
                          },
                          additionalProperties: false,
                        },
                        content: {
                          type: 'object',
                          properties: {
                            body: { type: 'string', nullable: true },
                            type: {
                              type: 'string',
                              enum: ['markdown', 'html'],
                              default: 'markdown',
                              description: 'The type of content contained in this custom page.',
                            },
                          },
                          required: ['body'],
                          additionalProperties: false,
                        },
                        metadata: {
                          type: 'object',
                          properties: {
                            description: { type: 'string', nullable: true },
                            image: {
                              type: 'object',
                              properties: {
                                uri: {
                                  type: 'string',
                                  pattern: '\\/images\\/([a-f\\d]{24})',
                                  nullable: true,
                                  description:
                                    'A URI to the `getImages` endpoint for this image. If the is a legacy image then this `uri` will be `null`. And if you wish to delete this image then you should set this to `null`.',
                                },
                                url: { type: 'string', format: 'uri', nullable: true },
                              },
                              required: ['uri', 'url'],
                              additionalProperties: false,
                            },
                            keywords: {
                              type: 'string',
                              nullable: true,
                              description:
                                'A comma-separated list of keywords to place into your custom page metadata.',
                            },
                            title: { type: 'string', nullable: true },
                          },
                          required: ['description', 'image', 'keywords', 'title'],
                          additionalProperties: false,
                        },
                        privacy: {
                          type: 'object',
                          properties: {
                            view: {
                              type: 'string',
                              enum: ['public', 'anyone_with_link'],
                              default: 'anyone_with_link',
                              description: 'The visibility of this custom page.',
                            },
                          },
                          additionalProperties: false,
                        },
                        slug: { type: 'string', pattern: '([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+' },
                        title: { type: 'string', nullable: true },
                        links: {
                          type: 'object',
                          properties: {
                            project: {
                              type: 'string',
                              pattern: '\\/projects\\/(me|[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*)',
                              description: 'A URI to the project resource.',
                            },
                          },
                          required: ['project'],
                          additionalProperties: false,
                        },
                        updated_at: {
                          type: 'string',
                          format: 'date-time',
                          description: 'An ISO 8601 formatted date for when the custom page was updated.',
                          nullable: true,
                        },
                        uri: {
                          type: 'string',
                          pattern:
                            '\\/versions\\/(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)\\/custom_pages\\/([a-f\\d]{24}|([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                        },
                      },
                      required: [
                        'appearance',
                        'content',
                        'metadata',
                        'privacy',
                        'slug',
                        'title',
                        'links',
                        'updated_at',
                        'uri',
                      ],
                      additionalProperties: false,
                    },
                  },
                  required: ['data'],
                  additionalProperties: false,
                },
              },
            },
          },
        },
      },
      delete: {
        operationId: 'deleteCustomPage',
        summary: 'Delete a custom page',
        tags: ['Custom Pages'],
        description:
          "Delete a custom page from your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).\n\n>🚧 ReadMe's API v2 is currently in beta.\n >This API and its documentation are a work in progress. While we don't expect any major breaking changes, you may encounter occasional issues as we work toward a stable release. Make sure to [check out our API migration guide](https://docs.readme.com/main/reference/api-migration-guide), and [feel free to reach out](mailto:support@readme.io) if you have any questions or feedback!",
        parameters: [
          {
            schema: { type: 'string', pattern: 'stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?' },
            in: 'path',
            name: 'version',
            required: true,
            description: 'Project version number or `stable` for your stable project version.',
          },
          {
            schema: { type: 'string', pattern: '([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+' },
            in: 'path',
            name: 'slug',
            required: true,
            description: 'A URL-safe representation of the resource.',
          },
        ],
        responses: { '204': { description: 'No Content' } },
      },
      patch: {
        operationId: 'updateCustomPage',
        summary: 'Update a custom page',
        tags: ['Custom Pages'],
        description:
          "Update an existing custom page in your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).\n\n>🚧 ReadMe's API v2 is currently in beta.\n >This API and its documentation are a work in progress. While we don't expect any major breaking changes, you may encounter occasional issues as we work toward a stable release. Make sure to [check out our API migration guide](https://docs.readme.com/main/reference/api-migration-guide), and [feel free to reach out](mailto:support@readme.io) if you have any questions or feedback!",
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  appearance: {
                    type: 'object',
                    properties: {
                      fullscreen: {
                        type: 'boolean',
                        default: false,
                        description: 'Whether a html custom page is fullscreen or not.',
                      },
                    },
                    additionalProperties: false,
                  },
                  content: {
                    type: 'object',
                    properties: {
                      body: { type: 'string', nullable: true },
                      type: {
                        type: 'string',
                        enum: ['markdown', 'html'],
                        default: 'markdown',
                        description: 'The type of content contained in this custom page.',
                      },
                    },
                    additionalProperties: false,
                  },
                  metadata: {
                    type: 'object',
                    properties: {
                      description: { type: 'string', nullable: true },
                      image: {
                        type: 'object',
                        properties: {
                          uri: { type: 'string', pattern: '\\/images\\/([a-f\\d]{24})', nullable: true },
                          url: { type: 'string', format: 'uri', nullable: true },
                        },
                        additionalProperties: false,
                      },
                      keywords: { type: 'string', nullable: true },
                      title: { type: 'string', nullable: true },
                    },
                    additionalProperties: false,
                  },
                  privacy: {
                    type: 'object',
                    properties: {
                      view: {
                        type: 'string',
                        enum: ['public', 'anyone_with_link'],
                        default: 'anyone_with_link',
                        description: 'The visibility of this custom page.',
                      },
                    },
                    additionalProperties: false,
                  },
                  slug: { type: 'string', pattern: '([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+' },
                  title: { type: 'string', nullable: true },
                },
                additionalProperties: false,
              },
            },
          },
        },
        parameters: [
          {
            schema: { type: 'string', pattern: 'stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?' },
            in: 'path',
            name: 'version',
            required: true,
            description: 'Project version number or `stable` for your stable project version.',
          },
          {
            schema: { type: 'string', pattern: '([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+' },
            in: 'path',
            name: 'slug',
            required: true,
            description: 'A URL-safe representation of the resource.',
          },
        ],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        appearance: {
                          type: 'object',
                          properties: {
                            fullscreen: {
                              type: 'boolean',
                              default: false,
                              description: 'Whether a html custom page is fullscreen or not.',
                            },
                          },
                          additionalProperties: false,
                        },
                        content: {
                          type: 'object',
                          properties: {
                            body: { type: 'string', nullable: true },
                            type: {
                              type: 'string',
                              enum: ['markdown', 'html'],
                              default: 'markdown',
                              description: 'The type of content contained in this custom page.',
                            },
                          },
                          required: ['body'],
                          additionalProperties: false,
                        },
                        metadata: {
                          type: 'object',
                          properties: {
                            description: { type: 'string', nullable: true },
                            image: {
                              type: 'object',
                              properties: {
                                uri: {
                                  type: 'string',
                                  pattern: '\\/images\\/([a-f\\d]{24})',
                                  nullable: true,
                                  description:
                                    'A URI to the `getImages` endpoint for this image. If the is a legacy image then this `uri` will be `null`. And if you wish to delete this image then you should set this to `null`.',
                                },
                                url: { type: 'string', format: 'uri', nullable: true },
                              },
                              required: ['uri', 'url'],
                              additionalProperties: false,
                            },
                            keywords: {
                              type: 'string',
                              nullable: true,
                              description:
                                'A comma-separated list of keywords to place into your custom page metadata.',
                            },
                            title: { type: 'string', nullable: true },
                          },
                          required: ['description', 'image', 'keywords', 'title'],
                          additionalProperties: false,
                        },
                        privacy: {
                          type: 'object',
                          properties: {
                            view: {
                              type: 'string',
                              enum: ['public', 'anyone_with_link'],
                              default: 'anyone_with_link',
                              description: 'The visibility of this custom page.',
                            },
                          },
                          additionalProperties: false,
                        },
                        slug: { type: 'string', pattern: '([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+' },
                        title: { type: 'string', nullable: true },
                        links: {
                          type: 'object',
                          properties: {
                            project: {
                              type: 'string',
                              pattern: '\\/projects\\/(me|[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*)',
                              description: 'A URI to the project resource.',
                            },
                          },
                          required: ['project'],
                          additionalProperties: false,
                        },
                        updated_at: {
                          type: 'string',
                          format: 'date-time',
                          description: 'An ISO 8601 formatted date for when the custom page was updated.',
                          nullable: true,
                        },
                        uri: {
                          type: 'string',
                          pattern:
                            '\\/versions\\/(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)\\/custom_pages\\/([a-f\\d]{24}|([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                        },
                      },
                      required: [
                        'appearance',
                        'content',
                        'metadata',
                        'privacy',
                        'slug',
                        'title',
                        'links',
                        'updated_at',
                        'uri',
                      ],
                      additionalProperties: false,
                    },
                  },
                  required: ['data'],
                  additionalProperties: false,
                },
              },
            },
          },
        },
      },
    },
    '/versions/{version}/guides': {
      post: {
        operationId: 'createGuide',
        summary: 'Create a guides page',
        tags: ['Guides'],
        description:
          "Create a page in the Guides section of your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).\n\n>🚧 ReadMe's API v2 is currently in beta.\n >This API and its documentation are a work in progress. While we don't expect any major breaking changes, you may encounter occasional issues as we work toward a stable release. Make sure to [check out our API migration guide](https://docs.readme.com/main/reference/api-migration-guide), and [feel free to reach out](mailto:support@readme.io) if you have any questions or feedback!",
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  allow_crawlers: {
                    type: 'string',
                    enum: ['enabled', 'disabled'],
                    default: 'enabled',
                    description: 'Allow indexing by robots.',
                  },
                  category: {
                    type: 'object',
                    properties: {
                      uri: {
                        type: 'string',
                        pattern:
                          '\\/versions\\/(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)\\/categories\\/(guides|reference)\\/((.*))',
                        description: 'A URI to the category resource.',
                      },
                    },
                    required: ['uri'],
                    additionalProperties: false,
                  },
                  content: {
                    type: 'object',
                    properties: {
                      body: { type: 'string', nullable: true },
                      excerpt: { type: 'string', nullable: true },
                      link: {
                        type: 'object',
                        properties: {
                          url: { type: 'string', nullable: true },
                          new_tab: { type: 'boolean', nullable: true },
                        },
                        additionalProperties: false,
                        description:
                          'Information about where this page should redirect to; only available when `type` is `link`.',
                      },
                      next: {
                        type: 'object',
                        properties: {
                          description: { type: 'string', nullable: true },
                          pages: {
                            type: 'array',
                            items: {
                              anyOf: [
                                {
                                  type: 'object',
                                  properties: {
                                    slug: { type: 'string' },
                                    title: { type: 'string', nullable: true },
                                    type: { type: 'string', enum: ['basic', 'endpoint'] },
                                  },
                                  required: ['slug', 'title', 'type'],
                                  additionalProperties: false,
                                },
                                {
                                  type: 'object',
                                  properties: {
                                    title: { type: 'string', nullable: true },
                                    type: { type: 'string', enum: ['link'] },
                                    url: { type: 'string' },
                                  },
                                  required: ['title', 'type', 'url'],
                                  additionalProperties: false,
                                },
                              ],
                            },
                          },
                        },
                        additionalProperties: false,
                      },
                    },
                    additionalProperties: false,
                  },
                  href: {
                    type: 'object',
                    properties: {
                      dash: { type: 'string', format: 'uri', description: 'A URL to this page in your ReadMe Dash.' },
                      hub: { type: 'string', format: 'uri', description: 'A URL to this page on your ReadMe hub.' },
                    },
                    additionalProperties: false,
                  },
                  metadata: {
                    type: 'object',
                    properties: {
                      description: { type: 'string', nullable: true },
                      keywords: { type: 'string', nullable: true },
                      title: { type: 'string', nullable: true },
                      image: {
                        type: 'object',
                        properties: { uri: { type: 'string', pattern: '\\/images\\/([a-f\\d]{24})', nullable: true } },
                        additionalProperties: false,
                      },
                    },
                    additionalProperties: false,
                  },
                  parent: {
                    type: 'object',
                    properties: {
                      uri: {
                        type: 'string',
                        pattern:
                          '\\/versions\\/(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)\\/(guides|reference)\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                        nullable: true,
                      },
                    },
                    additionalProperties: false,
                  },
                  privacy: {
                    type: 'object',
                    properties: {
                      view: { type: 'string', enum: ['public', 'anyone_with_link'], default: 'anyone_with_link' },
                    },
                    additionalProperties: false,
                  },
                  renderable: {
                    type: 'object',
                    properties: {
                      status: {
                        type: 'boolean',
                        default: true,
                        description: 'A flag for if the page is renderable or not.',
                      },
                      error: { type: 'string', nullable: true },
                      message: { type: 'string', nullable: true },
                    },
                    additionalProperties: false,
                  },
                  slug: {
                    allOf: [{ type: 'string' }, { type: 'string', minLength: 1 }],
                    description: 'The accessible URL slug for the page.',
                  },
                  state: { type: 'string', enum: ['current', 'deprecated'], default: 'current' },
                  title: { type: 'string' },
                  type: {
                    type: 'string',
                    enum: ['api_config', 'basic', 'endpoint', 'link', 'webhook'],
                    default: 'basic',
                  },
                  position: { type: 'number' },
                },
                required: ['category', 'title'],
                additionalProperties: false,
              },
            },
          },
          required: true,
        },
        parameters: [
          {
            schema: { type: 'string', pattern: 'stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?' },
            in: 'path',
            name: 'version',
            required: true,
            description: 'Project version number or `stable` for your stable project version.',
          },
        ],
        responses: {
          '201': {
            description: 'Created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        allow_crawlers: {
                          type: 'string',
                          enum: ['enabled', 'disabled'],
                          default: 'enabled',
                          description: 'Allow indexing by robots.',
                        },
                        category: {
                          type: 'object',
                          properties: {
                            uri: {
                              type: 'string',
                              pattern:
                                '\\/versions\\/(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)\\/categories\\/(guides|reference)\\/((.*))',
                              description: 'A URI to the category resource.',
                            },
                          },
                          required: ['uri'],
                          additionalProperties: false,
                        },
                        content: {
                          type: 'object',
                          properties: {
                            body: { type: 'string', nullable: true },
                            excerpt: { type: 'string', nullable: true },
                            link: {
                              type: 'object',
                              properties: {
                                url: { type: 'string', nullable: true },
                                new_tab: {
                                  type: 'boolean',
                                  nullable: true,
                                  description: 'Should this URL be opened up in a new tab?',
                                },
                              },
                              required: ['url', 'new_tab'],
                              additionalProperties: false,
                              description:
                                'Information about where this page should redirect to; only available when `type` is `link`.',
                            },
                            next: {
                              type: 'object',
                              properties: {
                                description: { type: 'string', nullable: true },
                                pages: {
                                  type: 'array',
                                  items: {
                                    anyOf: [
                                      {
                                        type: 'object',
                                        properties: {
                                          slug: { type: 'string' },
                                          title: { type: 'string', nullable: true },
                                          type: { type: 'string', enum: ['basic', 'endpoint'] },
                                        },
                                        required: ['slug', 'title', 'type'],
                                        additionalProperties: false,
                                      },
                                      {
                                        type: 'object',
                                        properties: {
                                          title: { type: 'string', nullable: true },
                                          type: { type: 'string', enum: ['link'] },
                                          url: { type: 'string' },
                                        },
                                        required: ['title', 'type', 'url'],
                                        additionalProperties: false,
                                      },
                                    ],
                                  },
                                },
                              },
                              required: ['description', 'pages'],
                              additionalProperties: false,
                            },
                          },
                          required: ['body', 'excerpt', 'link', 'next'],
                          additionalProperties: false,
                        },
                        href: {
                          type: 'object',
                          properties: {
                            dash: {
                              type: 'string',
                              format: 'uri',
                              description: 'A URL to this page in your ReadMe Dash.',
                            },
                            hub: {
                              type: 'string',
                              format: 'uri',
                              description: 'A URL to this page on your ReadMe hub.',
                            },
                          },
                          required: ['dash', 'hub'],
                          additionalProperties: false,
                        },
                        metadata: {
                          type: 'object',
                          properties: {
                            description: { type: 'string', nullable: true },
                            image: {
                              type: 'object',
                              properties: {
                                uri: {
                                  type: 'string',
                                  pattern: '\\/images\\/([a-f\\d]{24})',
                                  nullable: true,
                                  description:
                                    'A URI to the `getImages` endpoint for this image. If the is a legacy image then this `uri` will be `null`. And if you wish to delete this image then you should set this to `null`.',
                                },
                                url: { type: 'string', format: 'uri', nullable: true },
                              },
                              required: ['uri', 'url'],
                              additionalProperties: false,
                            },
                            keywords: {
                              type: 'string',
                              nullable: true,
                              description: 'A comma-separated list of keywords to place into your page metadata.',
                            },
                            title: { type: 'string', nullable: true },
                          },
                          required: ['description', 'image', 'keywords', 'title'],
                          additionalProperties: false,
                        },
                        parent: {
                          type: 'object',
                          properties: {
                            uri: {
                              type: 'string',
                              pattern:
                                '\\/versions\\/(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)\\/(guides|reference)\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                              nullable: true,
                              description: 'A URI to the parent page resource including the page ID or slug.',
                            },
                          },
                          required: ['uri'],
                          additionalProperties: false,
                        },
                        privacy: {
                          type: 'object',
                          properties: {
                            view: { type: 'string', enum: ['public', 'anyone_with_link'], default: 'anyone_with_link' },
                          },
                          additionalProperties: false,
                        },
                        project: {
                          type: 'object',
                          properties: {
                            name: { type: 'string', description: 'The name of the project.' },
                            subdomain: {
                              type: 'string',
                              pattern: '[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*',
                              maxLength: 30,
                              description: 'The subdomain of the project.',
                            },
                            uri: {
                              type: 'string',
                              pattern: '\\/projects\\/(me|[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*)',
                              description: 'A URI to the project that this page belongs to.',
                            },
                          },
                          required: ['name', 'subdomain', 'uri'],
                          additionalProperties: false,
                        },
                        renderable: {
                          type: 'object',
                          properties: {
                            status: {
                              type: 'boolean',
                              default: true,
                              description: 'A flag for if the page is renderable or not.',
                            },
                            error: { type: 'string', nullable: true, description: 'The rendering error.' },
                            message: {
                              type: 'string',
                              nullable: true,
                              description: 'Additional details about the rendering error.',
                            },
                          },
                          additionalProperties: false,
                        },
                        slug: {
                          allOf: [{ type: 'string' }, { type: 'string', minLength: 1 }],
                          description: 'The accessible URL slug for the page.',
                        },
                        state: { type: 'string', enum: ['current', 'deprecated'], default: 'current' },
                        title: { type: 'string' },
                        type: {
                          type: 'string',
                          enum: ['api_config', 'basic', 'endpoint', 'link', 'webhook'],
                          default: 'basic',
                        },
                        updated_at: {
                          type: 'string',
                          format: 'date-time',
                          description: 'An ISO 8601 formatted date for when the page was updated.',
                        },
                        uri: {
                          type: 'string',
                          pattern:
                            '\\/versions\\/(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)\\/(guides|reference)\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                          description: 'A URI to the page resource.',
                        },
                      },
                      required: [
                        'category',
                        'content',
                        'href',
                        'metadata',
                        'parent',
                        'privacy',
                        'project',
                        'renderable',
                        'slug',
                        'title',
                        'updated_at',
                        'uri',
                      ],
                      additionalProperties: false,
                    },
                  },
                  required: ['data'],
                  additionalProperties: false,
                },
              },
            },
          },
        },
      },
    },
    '/versions/{version}/guides/{slug}': {
      get: {
        operationId: 'getGuide',
        summary: 'Get a guides page',
        tags: ['Guides'],
        description:
          "Get a page from the Guides section of your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).\n\n>🚧 ReadMe's API v2 is currently in beta.\n >This API and its documentation are a work in progress. While we don't expect any major breaking changes, you may encounter occasional issues as we work toward a stable release. Make sure to [check out our API migration guide](https://docs.readme.com/main/reference/api-migration-guide), and [feel free to reach out](mailto:support@readme.io) if you have any questions or feedback!",
        parameters: [
          {
            schema: { type: 'string', pattern: 'stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?' },
            in: 'path',
            name: 'version',
            required: true,
            description: 'Project version number or `stable` for your stable project version.',
          },
          {
            schema: { type: 'string', pattern: '([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+' },
            in: 'path',
            name: 'slug',
            required: true,
            description: 'A URL-safe representation of the resource.',
          },
        ],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        allow_crawlers: {
                          type: 'string',
                          enum: ['enabled', 'disabled'],
                          default: 'enabled',
                          description: 'Allow indexing by robots.',
                        },
                        category: {
                          type: 'object',
                          properties: {
                            uri: {
                              type: 'string',
                              pattern:
                                '\\/versions\\/(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)\\/categories\\/(guides|reference)\\/((.*))',
                              description: 'A URI to the category resource.',
                            },
                          },
                          required: ['uri'],
                          additionalProperties: false,
                        },
                        content: {
                          type: 'object',
                          properties: {
                            body: { type: 'string', nullable: true },
                            excerpt: { type: 'string', nullable: true },
                            link: {
                              type: 'object',
                              properties: {
                                url: { type: 'string', nullable: true },
                                new_tab: {
                                  type: 'boolean',
                                  nullable: true,
                                  description: 'Should this URL be opened up in a new tab?',
                                },
                              },
                              required: ['url', 'new_tab'],
                              additionalProperties: false,
                              description:
                                'Information about where this page should redirect to; only available when `type` is `link`.',
                            },
                            next: {
                              type: 'object',
                              properties: {
                                description: { type: 'string', nullable: true },
                                pages: {
                                  type: 'array',
                                  items: {
                                    anyOf: [
                                      {
                                        type: 'object',
                                        properties: {
                                          slug: { type: 'string' },
                                          title: { type: 'string', nullable: true },
                                          type: { type: 'string', enum: ['basic', 'endpoint'] },
                                        },
                                        required: ['slug', 'title', 'type'],
                                        additionalProperties: false,
                                      },
                                      {
                                        type: 'object',
                                        properties: {
                                          title: { type: 'string', nullable: true },
                                          type: { type: 'string', enum: ['link'] },
                                          url: { type: 'string' },
                                        },
                                        required: ['title', 'type', 'url'],
                                        additionalProperties: false,
                                      },
                                    ],
                                  },
                                },
                              },
                              required: ['description', 'pages'],
                              additionalProperties: false,
                            },
                          },
                          required: ['body', 'excerpt', 'link', 'next'],
                          additionalProperties: false,
                        },
                        href: {
                          type: 'object',
                          properties: {
                            dash: {
                              type: 'string',
                              format: 'uri',
                              description: 'A URL to this page in your ReadMe Dash.',
                            },
                            hub: {
                              type: 'string',
                              format: 'uri',
                              description: 'A URL to this page on your ReadMe hub.',
                            },
                          },
                          required: ['dash', 'hub'],
                          additionalProperties: false,
                        },
                        metadata: {
                          type: 'object',
                          properties: {
                            description: { type: 'string', nullable: true },
                            image: {
                              type: 'object',
                              properties: {
                                uri: {
                                  type: 'string',
                                  pattern: '\\/images\\/([a-f\\d]{24})',
                                  nullable: true,
                                  description:
                                    'A URI to the `getImages` endpoint for this image. If the is a legacy image then this `uri` will be `null`. And if you wish to delete this image then you should set this to `null`.',
                                },
                                url: { type: 'string', format: 'uri', nullable: true },
                              },
                              required: ['uri', 'url'],
                              additionalProperties: false,
                            },
                            keywords: {
                              type: 'string',
                              nullable: true,
                              description: 'A comma-separated list of keywords to place into your page metadata.',
                            },
                            title: { type: 'string', nullable: true },
                          },
                          required: ['description', 'image', 'keywords', 'title'],
                          additionalProperties: false,
                        },
                        parent: {
                          type: 'object',
                          properties: {
                            uri: {
                              type: 'string',
                              pattern:
                                '\\/versions\\/(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)\\/(guides|reference)\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                              nullable: true,
                              description: 'A URI to the parent page resource including the page ID or slug.',
                            },
                          },
                          required: ['uri'],
                          additionalProperties: false,
                        },
                        privacy: {
                          type: 'object',
                          properties: {
                            view: { type: 'string', enum: ['public', 'anyone_with_link'], default: 'anyone_with_link' },
                          },
                          additionalProperties: false,
                        },
                        project: {
                          type: 'object',
                          properties: {
                            name: { type: 'string', description: 'The name of the project.' },
                            subdomain: {
                              type: 'string',
                              pattern: '[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*',
                              maxLength: 30,
                              description: 'The subdomain of the project.',
                            },
                            uri: {
                              type: 'string',
                              pattern: '\\/projects\\/(me|[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*)',
                              description: 'A URI to the project that this page belongs to.',
                            },
                          },
                          required: ['name', 'subdomain', 'uri'],
                          additionalProperties: false,
                        },
                        renderable: {
                          type: 'object',
                          properties: {
                            status: {
                              type: 'boolean',
                              default: true,
                              description: 'A flag for if the page is renderable or not.',
                            },
                            error: { type: 'string', nullable: true, description: 'The rendering error.' },
                            message: {
                              type: 'string',
                              nullable: true,
                              description: 'Additional details about the rendering error.',
                            },
                          },
                          additionalProperties: false,
                        },
                        slug: {
                          allOf: [{ type: 'string' }, { type: 'string', minLength: 1 }],
                          description: 'The accessible URL slug for the page.',
                        },
                        state: { type: 'string', enum: ['current', 'deprecated'], default: 'current' },
                        title: { type: 'string' },
                        type: {
                          type: 'string',
                          enum: ['api_config', 'basic', 'endpoint', 'link', 'webhook'],
                          default: 'basic',
                        },
                        updated_at: {
                          type: 'string',
                          format: 'date-time',
                          description: 'An ISO 8601 formatted date for when the page was updated.',
                        },
                        uri: {
                          type: 'string',
                          pattern:
                            '\\/versions\\/(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)\\/(guides|reference)\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                          description: 'A URI to the page resource.',
                        },
                      },
                      required: [
                        'category',
                        'content',
                        'href',
                        'metadata',
                        'parent',
                        'privacy',
                        'project',
                        'renderable',
                        'slug',
                        'title',
                        'updated_at',
                        'uri',
                      ],
                      additionalProperties: false,
                    },
                  },
                  required: ['data'],
                  additionalProperties: false,
                },
              },
            },
          },
        },
      },
      delete: {
        operationId: 'deleteGuide',
        summary: 'Delete a guides page',
        tags: ['Guides'],
        description:
          "Delete a page from the Guides section of your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).\n\n>🚧 ReadMe's API v2 is currently in beta.\n >This API and its documentation are a work in progress. While we don't expect any major breaking changes, you may encounter occasional issues as we work toward a stable release. Make sure to [check out our API migration guide](https://docs.readme.com/main/reference/api-migration-guide), and [feel free to reach out](mailto:support@readme.io) if you have any questions or feedback!",
        parameters: [
          {
            schema: { type: 'string', pattern: 'stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?' },
            in: 'path',
            name: 'version',
            required: true,
            description: 'Project version number or `stable` for your stable project version.',
          },
          {
            schema: { type: 'string', pattern: '([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+' },
            in: 'path',
            name: 'slug',
            required: true,
            description: 'A URL-safe representation of the resource.',
          },
        ],
        responses: { '204': { description: 'No Content' } },
      },
      patch: {
        operationId: 'updateGuide',
        summary: 'Update a guides page',
        tags: ['Guides'],
        description:
          "Updates an existing page in the Guides section of your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).\n\n>🚧 ReadMe's API v2 is currently in beta.\n >This API and its documentation are a work in progress. While we don't expect any major breaking changes, you may encounter occasional issues as we work toward a stable release. Make sure to [check out our API migration guide](https://docs.readme.com/main/reference/api-migration-guide), and [feel free to reach out](mailto:support@readme.io) if you have any questions or feedback!",
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  allow_crawlers: {
                    type: 'string',
                    enum: ['enabled', 'disabled'],
                    default: 'enabled',
                    description: 'Allow indexing by robots.',
                  },
                  category: {
                    type: 'object',
                    properties: {
                      uri: {
                        type: 'string',
                        pattern:
                          '\\/versions\\/(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)\\/categories\\/(guides|reference)\\/((.*))',
                        description: 'A URI to the category resource.',
                      },
                    },
                    additionalProperties: false,
                  },
                  content: {
                    type: 'object',
                    properties: {
                      body: { type: 'string', nullable: true },
                      excerpt: { type: 'string', nullable: true },
                      link: {
                        type: 'object',
                        properties: {
                          url: { type: 'string', nullable: true },
                          new_tab: { type: 'boolean', nullable: true },
                        },
                        additionalProperties: false,
                        description:
                          'Information about where this page should redirect to; only available when `type` is `link`.',
                      },
                      next: {
                        type: 'object',
                        properties: {
                          description: { type: 'string', nullable: true },
                          pages: {
                            type: 'array',
                            items: {
                              anyOf: [
                                {
                                  type: 'object',
                                  properties: {
                                    slug: { type: 'string' },
                                    title: { type: 'string', nullable: true },
                                    type: { type: 'string', enum: ['basic', 'endpoint'] },
                                  },
                                  required: ['slug', 'title', 'type'],
                                  additionalProperties: false,
                                },
                                {
                                  type: 'object',
                                  properties: {
                                    title: { type: 'string', nullable: true },
                                    type: { type: 'string', enum: ['link'] },
                                    url: { type: 'string' },
                                  },
                                  required: ['title', 'type', 'url'],
                                  additionalProperties: false,
                                },
                              ],
                            },
                          },
                        },
                        additionalProperties: false,
                      },
                    },
                    additionalProperties: false,
                  },
                  href: {
                    type: 'object',
                    properties: {
                      dash: { type: 'string', format: 'uri', description: 'A URL to this page in your ReadMe Dash.' },
                      hub: { type: 'string', format: 'uri', description: 'A URL to this page on your ReadMe hub.' },
                    },
                    additionalProperties: false,
                  },
                  metadata: {
                    type: 'object',
                    properties: {
                      description: { type: 'string', nullable: true },
                      keywords: { type: 'string', nullable: true },
                      title: { type: 'string', nullable: true },
                      image: {
                        type: 'object',
                        properties: { uri: { type: 'string', pattern: '\\/images\\/([a-f\\d]{24})', nullable: true } },
                        additionalProperties: false,
                      },
                    },
                    additionalProperties: false,
                  },
                  parent: {
                    type: 'object',
                    properties: {
                      uri: {
                        type: 'string',
                        pattern:
                          '\\/versions\\/(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)\\/(guides|reference)\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                        nullable: true,
                      },
                    },
                    additionalProperties: false,
                  },
                  privacy: {
                    type: 'object',
                    properties: {
                      view: { type: 'string', enum: ['public', 'anyone_with_link'], default: 'anyone_with_link' },
                    },
                    additionalProperties: false,
                  },
                  renderable: {
                    type: 'object',
                    properties: {
                      status: {
                        type: 'boolean',
                        default: true,
                        description: 'A flag for if the page is renderable or not.',
                      },
                      error: { type: 'string', nullable: true },
                      message: { type: 'string', nullable: true },
                    },
                    additionalProperties: false,
                  },
                  slug: {
                    allOf: [{ type: 'string' }, { type: 'string', minLength: 1 }],
                    description: 'The accessible URL slug for the page.',
                  },
                  state: { type: 'string', enum: ['current', 'deprecated'], default: 'current' },
                  title: { type: 'string' },
                  type: {
                    type: 'string',
                    enum: ['api_config', 'basic', 'endpoint', 'link', 'webhook'],
                    default: 'basic',
                  },
                  position: { type: 'number' },
                },
                additionalProperties: false,
              },
            },
          },
        },
        parameters: [
          {
            schema: { type: 'string', pattern: 'stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?' },
            in: 'path',
            name: 'version',
            required: true,
            description: 'Project version number or `stable` for your stable project version.',
          },
          {
            schema: { type: 'string', pattern: '([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+' },
            in: 'path',
            name: 'slug',
            required: true,
            description: 'A URL-safe representation of the resource.',
          },
        ],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        allow_crawlers: {
                          type: 'string',
                          enum: ['enabled', 'disabled'],
                          default: 'enabled',
                          description: 'Allow indexing by robots.',
                        },
                        category: {
                          type: 'object',
                          properties: {
                            uri: {
                              type: 'string',
                              pattern:
                                '\\/versions\\/(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)\\/categories\\/(guides|reference)\\/((.*))',
                              description: 'A URI to the category resource.',
                            },
                          },
                          required: ['uri'],
                          additionalProperties: false,
                        },
                        content: {
                          type: 'object',
                          properties: {
                            body: { type: 'string', nullable: true },
                            excerpt: { type: 'string', nullable: true },
                            link: {
                              type: 'object',
                              properties: {
                                url: { type: 'string', nullable: true },
                                new_tab: {
                                  type: 'boolean',
                                  nullable: true,
                                  description: 'Should this URL be opened up in a new tab?',
                                },
                              },
                              required: ['url', 'new_tab'],
                              additionalProperties: false,
                              description:
                                'Information about where this page should redirect to; only available when `type` is `link`.',
                            },
                            next: {
                              type: 'object',
                              properties: {
                                description: { type: 'string', nullable: true },
                                pages: {
                                  type: 'array',
                                  items: {
                                    anyOf: [
                                      {
                                        type: 'object',
                                        properties: {
                                          slug: { type: 'string' },
                                          title: { type: 'string', nullable: true },
                                          type: { type: 'string', enum: ['basic', 'endpoint'] },
                                        },
                                        required: ['slug', 'title', 'type'],
                                        additionalProperties: false,
                                      },
                                      {
                                        type: 'object',
                                        properties: {
                                          title: { type: 'string', nullable: true },
                                          type: { type: 'string', enum: ['link'] },
                                          url: { type: 'string' },
                                        },
                                        required: ['title', 'type', 'url'],
                                        additionalProperties: false,
                                      },
                                    ],
                                  },
                                },
                              },
                              required: ['description', 'pages'],
                              additionalProperties: false,
                            },
                          },
                          required: ['body', 'excerpt', 'link', 'next'],
                          additionalProperties: false,
                        },
                        href: {
                          type: 'object',
                          properties: {
                            dash: {
                              type: 'string',
                              format: 'uri',
                              description: 'A URL to this page in your ReadMe Dash.',
                            },
                            hub: {
                              type: 'string',
                              format: 'uri',
                              description: 'A URL to this page on your ReadMe hub.',
                            },
                          },
                          required: ['dash', 'hub'],
                          additionalProperties: false,
                        },
                        metadata: {
                          type: 'object',
                          properties: {
                            description: { type: 'string', nullable: true },
                            image: {
                              type: 'object',
                              properties: {
                                uri: {
                                  type: 'string',
                                  pattern: '\\/images\\/([a-f\\d]{24})',
                                  nullable: true,
                                  description:
                                    'A URI to the `getImages` endpoint for this image. If the is a legacy image then this `uri` will be `null`. And if you wish to delete this image then you should set this to `null`.',
                                },
                                url: { type: 'string', format: 'uri', nullable: true },
                              },
                              required: ['uri', 'url'],
                              additionalProperties: false,
                            },
                            keywords: {
                              type: 'string',
                              nullable: true,
                              description: 'A comma-separated list of keywords to place into your page metadata.',
                            },
                            title: { type: 'string', nullable: true },
                          },
                          required: ['description', 'image', 'keywords', 'title'],
                          additionalProperties: false,
                        },
                        parent: {
                          type: 'object',
                          properties: {
                            uri: {
                              type: 'string',
                              pattern:
                                '\\/versions\\/(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)\\/(guides|reference)\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                              nullable: true,
                              description: 'A URI to the parent page resource including the page ID or slug.',
                            },
                          },
                          required: ['uri'],
                          additionalProperties: false,
                        },
                        privacy: {
                          type: 'object',
                          properties: {
                            view: { type: 'string', enum: ['public', 'anyone_with_link'], default: 'anyone_with_link' },
                          },
                          additionalProperties: false,
                        },
                        project: {
                          type: 'object',
                          properties: {
                            name: { type: 'string', description: 'The name of the project.' },
                            subdomain: {
                              type: 'string',
                              pattern: '[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*',
                              maxLength: 30,
                              description: 'The subdomain of the project.',
                            },
                            uri: {
                              type: 'string',
                              pattern: '\\/projects\\/(me|[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*)',
                              description: 'A URI to the project that this page belongs to.',
                            },
                          },
                          required: ['name', 'subdomain', 'uri'],
                          additionalProperties: false,
                        },
                        renderable: {
                          type: 'object',
                          properties: {
                            status: {
                              type: 'boolean',
                              default: true,
                              description: 'A flag for if the page is renderable or not.',
                            },
                            error: { type: 'string', nullable: true, description: 'The rendering error.' },
                            message: {
                              type: 'string',
                              nullable: true,
                              description: 'Additional details about the rendering error.',
                            },
                          },
                          additionalProperties: false,
                        },
                        slug: {
                          allOf: [{ type: 'string' }, { type: 'string', minLength: 1 }],
                          description: 'The accessible URL slug for the page.',
                        },
                        state: { type: 'string', enum: ['current', 'deprecated'], default: 'current' },
                        title: { type: 'string' },
                        type: {
                          type: 'string',
                          enum: ['api_config', 'basic', 'endpoint', 'link', 'webhook'],
                          default: 'basic',
                        },
                        updated_at: {
                          type: 'string',
                          format: 'date-time',
                          description: 'An ISO 8601 formatted date for when the page was updated.',
                        },
                        uri: {
                          type: 'string',
                          pattern:
                            '\\/versions\\/(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)\\/(guides|reference)\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                          description: 'A URI to the page resource.',
                        },
                      },
                      required: [
                        'category',
                        'content',
                        'href',
                        'metadata',
                        'parent',
                        'privacy',
                        'project',
                        'renderable',
                        'slug',
                        'title',
                        'updated_at',
                        'uri',
                      ],
                      additionalProperties: false,
                    },
                  },
                  required: ['data'],
                  additionalProperties: false,
                },
              },
            },
          },
        },
      },
    },
    '/projects/me': {
      get: {
        operationId: 'getProject',
        summary: 'Get project metadata',
        tags: ['Projects'],
        description:
          "Returns data about your project.\n\n>🚧 ReadMe's API v2 is currently in beta.\n >This API and its documentation are a work in progress. While we don't expect any major breaking changes, you may encounter occasional issues as we work toward a stable release. Make sure to [check out our API migration guide](https://docs.readme.com/main/reference/api-migration-guide), and [feel free to reach out](mailto:support@readme.io) if you have any questions or feedback!",
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        allow_crawlers: {
                          type: 'string',
                          enum: ['enabled', 'disabled'],
                          default: 'enabled',
                          description: 'Allow indexing by robots.',
                        },
                        api_designer: {
                          type: 'object',
                          properties: {
                            allow_editing: {
                              type: 'string',
                              enum: ['enabled', 'disabled'],
                              default: 'enabled',
                              description: 'API Designer is enabled for this project.',
                            },
                          },
                          additionalProperties: false,
                        },
                        appearance: {
                          type: 'object',
                          properties: {
                            brand: {
                              type: 'object',
                              properties: {
                                primary_color: { type: 'string', nullable: true },
                                link_color: { type: 'string', nullable: true },
                                theme: { type: 'string', enum: ['system', 'light', 'dark'], default: 'light' },
                              },
                              required: ['primary_color', 'link_color'],
                              additionalProperties: false,
                            },
                            changelog: {
                              type: 'object',
                              properties: {
                                layout: { type: 'string', enum: ['collapsed', 'continuous'], default: 'collapsed' },
                                show_author: {
                                  type: 'boolean',
                                  default: true,
                                  description: 'Should the changelog author be shown?',
                                },
                                show_exact_date: {
                                  type: 'boolean',
                                  default: false,
                                  description:
                                    'Should the exact date of the changelog entry be shown, or should it be relative?',
                                },
                              },
                              additionalProperties: false,
                            },
                            custom_code: {
                              type: 'object',
                              properties: {
                                css: {
                                  type: 'string',
                                  nullable: true,
                                  description:
                                    'A chunk of custom CSS that you can use to override default CSS that we provide.',
                                },
                                js: {
                                  type: 'string',
                                  nullable: true,
                                  description:
                                    'A chunk of custom JS that you can use to override or add new behaviors to your documentation. Please note that we do not do any validation on the code that goes in here so you have the potential to negatively impact your users with broken code.',
                                },
                                html: {
                                  type: 'object',
                                  properties: {
                                    header: {
                                      type: 'string',
                                      nullable: true,
                                      description:
                                        'A block of custom HTML that will be added to your `<head>` tag. Good for things like `<meta>` tags or loading external CSS.',
                                    },
                                    home_footer: {
                                      type: 'string',
                                      nullable: true,
                                      description:
                                        'A block of custom HTML that will appear in a `<footer>` element on all of your pages',
                                    },
                                    page_footer: {
                                      type: 'string',
                                      nullable: true,
                                      description:
                                        'A block of custom HTML that will be added before the closing `</body>` tag of your pages.',
                                    },
                                  },
                                  required: ['header', 'home_footer', 'page_footer'],
                                  additionalProperties: false,
                                },
                              },
                              required: ['css', 'js', 'html'],
                              additionalProperties: false,
                            },
                            footer: {
                              type: 'object',
                              properties: { readme_logo: { type: 'string', enum: ['hide', 'show'], default: 'show' } },
                              additionalProperties: false,
                            },
                            header: {
                              type: 'object',
                              properties: {
                                type: {
                                  type: 'string',
                                  enum: ['solid', 'gradient', 'line', 'overlay'],
                                  default: 'solid',
                                },
                                gradient_color: { type: 'string', nullable: true },
                                link_style: {
                                  type: 'string',
                                  enum: ['buttons', 'tabs'],
                                  default: 'buttons',
                                  description:
                                    'The styling setting of the subnav links. This value is only used if `appearance.header.type` is `line`.',
                                },
                                overlay: {
                                  type: 'object',
                                  properties: {
                                    image: {
                                      type: 'object',
                                      properties: {
                                        name: { type: 'string', nullable: true },
                                        width: {
                                          type: 'number',
                                          nullable: true,
                                          description: 'The pixel width of the image. This is not present for SVGs.',
                                        },
                                        height: {
                                          type: 'number',
                                          nullable: true,
                                          description: 'The pixel height of the image. This is not present for SVGs.',
                                        },
                                        color: {
                                          type: 'string',
                                          pattern:
                                            '^(?:#[0-9a-fA-F]{3}|#[0-9a-fA-F]{4}|#[0-9a-fA-F]{6}|#[0-9a-fA-F]{8})$',
                                          nullable: true,
                                          description: 'The primary color contained within your image.',
                                        },
                                        links: {
                                          type: 'object',
                                          properties: {
                                            original_url: {
                                              type: 'string',
                                              format: 'uri',
                                              nullable: true,
                                              description:
                                                'If your image was resized upon upload this will be a URL to the original file.',
                                            },
                                          },
                                          required: ['original_url'],
                                          additionalProperties: false,
                                        },
                                        uri: {
                                          type: 'string',
                                          pattern: '\\/images\\/([a-f\\d]{24})',
                                          nullable: true,
                                          description:
                                            'A URI to the `getImages` endpoint for this image. If the is a legacy image then this `uri` will be `null`. And if you wish to delete this image then you should set this to `null`.',
                                        },
                                        url: { type: 'string', format: 'uri', nullable: true },
                                      },
                                      required: ['name', 'width', 'height', 'color', 'links', 'uri', 'url'],
                                      additionalProperties: false,
                                    },
                                    type: {
                                      type: 'string',
                                      enum: ['triangles', 'blueprint', 'grain', 'map', 'circuits', 'custom'],
                                      default: 'triangles',
                                      description:
                                        'The header overlay type. This value is only used if `appearance.header.type` is `overlay`.',
                                    },
                                    fill: {
                                      type: 'string',
                                      enum: ['auto', 'tile', 'tile-x', 'tile-y', 'cover', 'contain'],
                                      default: 'auto',
                                      description:
                                        'The header fill type. This is only used if `appearance.header.overlay.type` is `custom`.',
                                    },
                                    position: {
                                      type: 'string',
                                      enum: [
                                        'top-left',
                                        'top-center',
                                        'top-right',
                                        'center-left',
                                        'center-center',
                                        'center-right',
                                        'bottom-left',
                                        'bottom-center',
                                        'bottom-right',
                                      ],
                                      default: 'top-left',
                                      description:
                                        'The positioning of the header. This is only used if `appearance.header.overlay.type` is `custom`.',
                                    },
                                  },
                                  required: ['image'],
                                  additionalProperties: false,
                                },
                              },
                              required: ['gradient_color', 'overlay'],
                              additionalProperties: false,
                            },
                            logo: {
                              type: 'object',
                              properties: {
                                dark_mode: {
                                  type: 'object',
                                  properties: {
                                    name: { type: 'string', nullable: true },
                                    width: {
                                      type: 'number',
                                      nullable: true,
                                      description: 'The pixel width of the image. This is not present for SVGs.',
                                    },
                                    height: {
                                      type: 'number',
                                      nullable: true,
                                      description: 'The pixel height of the image. This is not present for SVGs.',
                                    },
                                    color: {
                                      type: 'string',
                                      pattern: '^(?:#[0-9a-fA-F]{3}|#[0-9a-fA-F]{4}|#[0-9a-fA-F]{6}|#[0-9a-fA-F]{8})$',
                                      nullable: true,
                                      description: 'The primary color contained within your image.',
                                    },
                                    links: {
                                      type: 'object',
                                      properties: {
                                        original_url: {
                                          type: 'string',
                                          format: 'uri',
                                          nullable: true,
                                          description:
                                            'If your image was resized upon upload this will be a URL to the original file.',
                                        },
                                      },
                                      required: ['original_url'],
                                      additionalProperties: false,
                                    },
                                    uri: {
                                      type: 'string',
                                      pattern: '\\/images\\/([a-f\\d]{24})',
                                      nullable: true,
                                      description:
                                        'A URI to the `getImages` endpoint for this image. If the is a legacy image then this `uri` will be `null`. And if you wish to delete this image then you should set this to `null`.',
                                    },
                                    url: { type: 'string', format: 'uri', nullable: true },
                                  },
                                  required: ['name', 'width', 'height', 'color', 'links', 'uri', 'url'],
                                  additionalProperties: false,
                                },
                                main: {
                                  type: 'object',
                                  properties: {
                                    name: { type: 'string', nullable: true },
                                    width: {
                                      type: 'number',
                                      nullable: true,
                                      description: 'The pixel width of the image. This is not present for SVGs.',
                                    },
                                    height: {
                                      type: 'number',
                                      nullable: true,
                                      description: 'The pixel height of the image. This is not present for SVGs.',
                                    },
                                    color: {
                                      type: 'string',
                                      pattern: '^(?:#[0-9a-fA-F]{3}|#[0-9a-fA-F]{4}|#[0-9a-fA-F]{6}|#[0-9a-fA-F]{8})$',
                                      nullable: true,
                                      description: 'The primary color contained within your image.',
                                    },
                                    links: {
                                      type: 'object',
                                      properties: {
                                        original_url: {
                                          type: 'string',
                                          format: 'uri',
                                          nullable: true,
                                          description:
                                            'If your image was resized upon upload this will be a URL to the original file.',
                                        },
                                      },
                                      required: ['original_url'],
                                      additionalProperties: false,
                                    },
                                    uri: {
                                      type: 'string',
                                      pattern: '\\/images\\/([a-f\\d]{24})',
                                      nullable: true,
                                      description:
                                        'A URI to the `getImages` endpoint for this image. If the is a legacy image then this `uri` will be `null`. And if you wish to delete this image then you should set this to `null`.',
                                    },
                                    url: { type: 'string', format: 'uri', nullable: true },
                                  },
                                  required: ['name', 'width', 'height', 'color', 'links', 'uri', 'url'],
                                  additionalProperties: false,
                                },
                                favicon: {
                                  type: 'object',
                                  properties: {
                                    name: { type: 'string', nullable: true },
                                    width: {
                                      type: 'number',
                                      nullable: true,
                                      description: 'The pixel width of the image. This is not present for SVGs.',
                                    },
                                    height: {
                                      type: 'number',
                                      nullable: true,
                                      description: 'The pixel height of the image. This is not present for SVGs.',
                                    },
                                    color: {
                                      type: 'string',
                                      pattern: '^(?:#[0-9a-fA-F]{3}|#[0-9a-fA-F]{4}|#[0-9a-fA-F]{6}|#[0-9a-fA-F]{8})$',
                                      nullable: true,
                                      description: 'The primary color contained within your image.',
                                    },
                                    links: {
                                      type: 'object',
                                      properties: {
                                        original_url: {
                                          type: 'string',
                                          format: 'uri',
                                          nullable: true,
                                          description:
                                            'If your image was resized upon upload this will be a URL to the original file.',
                                        },
                                      },
                                      required: ['original_url'],
                                      additionalProperties: false,
                                    },
                                    uri: {
                                      type: 'string',
                                      pattern: '\\/images\\/([a-f\\d]{24})',
                                      nullable: true,
                                      description:
                                        'A URI to the `getImages` endpoint for this image. If the is a legacy image then this `uri` will be `null`. And if you wish to delete this image then you should set this to `null`.',
                                    },
                                    url: { type: 'string', format: 'uri', nullable: true },
                                  },
                                  required: ['name', 'width', 'height', 'color', 'links', 'uri', 'url'],
                                  additionalProperties: false,
                                },
                                size: { type: 'string', enum: ['default', 'large'], default: 'default' },
                              },
                              required: ['dark_mode', 'main', 'favicon'],
                              additionalProperties: false,
                            },
                            markdown: {
                              type: 'object',
                              properties: {
                                callouts: {
                                  type: 'object',
                                  properties: {
                                    icon_font: {
                                      type: 'string',
                                      enum: ['emojis', 'fontawesome'],
                                      default: 'emojis',
                                      description: 'Handles the types of icons that are shown in Markdown callouts.',
                                    },
                                  },
                                  additionalProperties: false,
                                },
                              },
                              required: ['callouts'],
                              additionalProperties: false,
                            },
                            navigation: {
                              type: 'object',
                              properties: {
                                first_page: {
                                  type: 'string',
                                  enum: ['documentation', 'reference', 'landing_page'],
                                  default: 'landing_page',
                                  description:
                                    'The page that users will first see when they access your documentation hub.',
                                },
                                left: {
                                  type: 'array',
                                  items: {
                                    type: 'object',
                                    properties: {
                                      type: {
                                        type: 'string',
                                        enum: [
                                          'home',
                                          'guides',
                                          'discussions',
                                          'changelog',
                                          'search_box',
                                          'link_url',
                                          'custom_page',
                                          'user_controls',
                                          'reference',
                                          'recipes',
                                        ],
                                      },
                                      title: { type: 'string', nullable: true },
                                      url: { type: 'string', nullable: true },
                                      custom_page: { type: 'string', nullable: true },
                                    },
                                    required: ['type', 'title', 'url', 'custom_page'],
                                    additionalProperties: false,
                                  },
                                  description:
                                    'The navigation settings for the left side of your projects navigation bar.',
                                },
                                links: {
                                  type: 'object',
                                  properties: {
                                    changelog: {
                                      type: 'object',
                                      properties: {
                                        label: { type: 'string', enum: ['Changelog'] },
                                        alias: { type: 'string', nullable: true },
                                        visibility: {
                                          type: 'string',
                                          enum: ['enabled', 'disabled'],
                                          default: 'enabled',
                                        },
                                      },
                                      required: ['label', 'alias'],
                                      additionalProperties: false,
                                    },
                                    discussions: {
                                      type: 'object',
                                      properties: {
                                        label: { type: 'string', enum: ['Discussions'] },
                                        alias: { type: 'string', nullable: true },
                                        visibility: {
                                          type: 'string',
                                          enum: ['enabled', 'disabled'],
                                          default: 'enabled',
                                        },
                                      },
                                      required: ['label', 'alias'],
                                      additionalProperties: false,
                                    },
                                    home: {
                                      type: 'object',
                                      properties: {
                                        label: { type: 'string', enum: ['Home'] },
                                        visibility: {
                                          type: 'string',
                                          enum: ['enabled', 'disabled'],
                                          default: 'enabled',
                                        },
                                      },
                                      required: ['label'],
                                      additionalProperties: false,
                                    },
                                    graphql: {
                                      type: 'object',
                                      properties: {
                                        label: { type: 'string', enum: ['GraphQL'] },
                                        visibility: {
                                          type: 'string',
                                          enum: ['enabled', 'disabled'],
                                          default: 'disabled',
                                          nullable: true,
                                        },
                                      },
                                      required: ['label'],
                                      additionalProperties: false,
                                    },
                                    guides: {
                                      type: 'object',
                                      properties: {
                                        label: { type: 'string', enum: ['Guides'] },
                                        alias: { type: 'string', nullable: true },
                                        visibility: {
                                          type: 'string',
                                          enum: ['enabled', 'disabled'],
                                          default: 'enabled',
                                        },
                                      },
                                      required: ['label', 'alias'],
                                      additionalProperties: false,
                                    },
                                    recipes: {
                                      type: 'object',
                                      properties: {
                                        label: { type: 'string', enum: ['Recipes'] },
                                        alias: { type: 'string', nullable: true },
                                        visibility: {
                                          type: 'string',
                                          enum: ['enabled', 'disabled'],
                                          default: 'disabled',
                                        },
                                      },
                                      required: ['label', 'alias'],
                                      additionalProperties: false,
                                    },
                                    reference: {
                                      type: 'object',
                                      properties: {
                                        label: { type: 'string', enum: ['API Reference'] },
                                        alias: { type: 'string', nullable: true },
                                        visibility: {
                                          type: 'string',
                                          enum: ['enabled', 'disabled'],
                                          default: 'enabled',
                                        },
                                      },
                                      required: ['label', 'alias'],
                                      additionalProperties: false,
                                    },
                                  },
                                  required: [
                                    'changelog',
                                    'discussions',
                                    'home',
                                    'graphql',
                                    'guides',
                                    'recipes',
                                    'reference',
                                  ],
                                  additionalProperties: false,
                                },
                                logo_link: {
                                  type: 'string',
                                  enum: ['landing_page', 'homepage'],
                                  default: 'homepage',
                                  description:
                                    'Where users will be directed to when they click on your logo in the navigation bar.',
                                },
                                right: {
                                  type: 'array',
                                  items: {
                                    type: 'object',
                                    properties: {
                                      type: {
                                        type: 'string',
                                        enum: [
                                          'home',
                                          'guides',
                                          'discussions',
                                          'changelog',
                                          'search_box',
                                          'link_url',
                                          'custom_page',
                                          'user_controls',
                                          'reference',
                                          'recipes',
                                        ],
                                      },
                                      title: { type: 'string', nullable: true },
                                      url: { type: 'string', nullable: true },
                                      custom_page: { type: 'string', nullable: true },
                                    },
                                    required: ['type', 'title', 'url', 'custom_page'],
                                    additionalProperties: false,
                                  },
                                  description:
                                    'The navigation settings for the right side of your projects navigation bar.',
                                },
                                sub_nav: {
                                  type: 'array',
                                  items: {
                                    type: 'object',
                                    properties: {
                                      type: {
                                        type: 'string',
                                        enum: [
                                          'home',
                                          'guides',
                                          'discussions',
                                          'changelog',
                                          'search_box',
                                          'link_url',
                                          'custom_page',
                                          'user_controls',
                                          'reference',
                                          'recipes',
                                        ],
                                      },
                                      title: { type: 'string', nullable: true },
                                      url: { type: 'string', nullable: true },
                                      custom_page: { type: 'string', nullable: true },
                                    },
                                    required: ['type', 'title', 'url', 'custom_page'],
                                    additionalProperties: false,
                                  },
                                  description: 'The navigation settings for your projects subnavigation bar.',
                                },
                                subheader_layout: { type: 'string', enum: ['links', 'dropdown'], default: 'links' },
                                version: {
                                  type: 'string',
                                  enum: ['enabled', 'disabled'],
                                  default: 'enabled',
                                  description:
                                    'Should your current documentation version be shown in the navigation bar?',
                                },
                              },
                              required: ['left', 'links', 'right', 'sub_nav'],
                              additionalProperties: false,
                            },
                            table_of_contents: {
                              type: 'string',
                              enum: ['enabled', 'disabled'],
                              default: 'enabled',
                              description: 'Should your guides show a table of contents?',
                            },
                            whats_next_label: {
                              type: 'string',
                              nullable: true,
                              description:
                                'What should we call the next steps section of your guides? Defaults to "What\'s Next".',
                            },
                          },
                          required: [
                            'brand',
                            'changelog',
                            'custom_code',
                            'footer',
                            'header',
                            'logo',
                            'markdown',
                            'navigation',
                            'whats_next_label',
                          ],
                          additionalProperties: false,
                        },
                        canonical_url: {
                          type: 'string',
                          format: 'uri',
                          nullable: true,
                          description:
                            "The canonical base URL for your project defaults to your project's base URL, but you can override the canonical base URL with this field.",
                        },
                        custom_login: {
                          type: 'object',
                          properties: {
                            jwt_secret: { type: 'string' },
                            login_url: { type: 'string', nullable: true },
                            logout_url: { type: 'string', nullable: true },
                          },
                          required: ['jwt_secret', 'login_url', 'logout_url'],
                          additionalProperties: false,
                        },
                        default_version: {
                          type: 'object',
                          properties: {
                            name: {
                              type: 'string',
                              pattern: 'stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?',
                              description: 'The version of your project that users are directed to by default.',
                            },
                          },
                          required: ['name'],
                          additionalProperties: false,
                        },
                        description: {
                          type: 'string',
                          nullable: true,
                          description:
                            'The description of your project. This is used in the page meta description and is seen by search engines and sites like Facebook.',
                        },
                        glossary: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              term: {
                                type: 'string',
                                description:
                                  'Glossary term is what gets displayed in your documentation when embedded.',
                              },
                              definition: {
                                type: 'string',
                                description:
                                  'Glossary definition is revealed to users when they mouse over the glossary term.',
                              },
                            },
                            required: ['term', 'definition'],
                            additionalProperties: false,
                          },
                          default: [],
                          description:
                            'List of glossary terms in your project that can be used within your documentation.',
                        },
                        health_check: {
                          type: 'object',
                          properties: {
                            provider: {
                              type: 'string',
                              enum: ['manual', 'statuspage', 'none'],
                              default: 'none',
                              description:
                                'The type of provider you wish to use for for managing your APIs health: manually or through [Atlassian Statuspage](https://www.atlassian.com/software/statuspage).',
                            },
                            settings: {
                              type: 'object',
                              properties: {
                                manual: {
                                  type: 'object',
                                  properties: {
                                    status: {
                                      type: 'string',
                                      enum: ['up', 'down'],
                                      default: 'up',
                                      description:
                                        'If you are manually managing your APIs health this is a status boolean indicating if your API is up or down.',
                                    },
                                    url: {
                                      type: 'string',
                                      nullable: true,
                                      description:
                                        'The URL that we will show to your users when your API is down. This is only used when `health_check.provider` is set to `manual`.',
                                    },
                                  },
                                  required: ['url'],
                                  additionalProperties: false,
                                },
                                statuspage: {
                                  type: 'object',
                                  properties: {
                                    id: {
                                      type: 'string',
                                      nullable: true,
                                      description:
                                        'If managing your APIs health through [Statuspage](https://www.atlassian.com/software/statuspage) this is your Statuspage ID.',
                                    },
                                  },
                                  required: ['id'],
                                  additionalProperties: false,
                                },
                              },
                              required: ['manual', 'statuspage'],
                              additionalProperties: false,
                            },
                          },
                          required: ['settings'],
                          additionalProperties: false,
                        },
                        homepage_url: {
                          type: 'string',
                          nullable: true,
                          description:
                            'The URL for your company\'s main website. We\'ll link to it in various places so people can "Go Home".',
                        },
                        integrations: {
                          type: 'object',
                          properties: {
                            aws: {
                              type: 'object',
                              properties: {
                                readme_webhook_login: {
                                  type: 'object',
                                  properties: {
                                    external_id: { type: 'string', nullable: true },
                                    region: {
                                      type: 'string',
                                      enum: [
                                        'af-south-1',
                                        'ap-east-1',
                                        'ap-northeast-1',
                                        'ap-northeast-2',
                                        'ap-northeast-3',
                                        'ap-south-1',
                                        'ap-south-2',
                                        'ap-southeast-1',
                                        'ap-southeast-2',
                                        'ap-southeast-3',
                                        'ap-southeast-4',
                                        'ap-southeast-5',
                                        'ca-central-1',
                                        'ca-west-1',
                                        'cn-north-1',
                                        'cn-northwest-1',
                                        'eu-central-1',
                                        'eu-central-2',
                                        'eu-north-1',
                                        'eu-south-1',
                                        'eu-south-2',
                                        'eu-west-1',
                                        'eu-west-2',
                                        'eu-west-3',
                                        'il-central-1',
                                        'me-central-1',
                                        'me-south-1',
                                        'sa-east-1',
                                        'us-east-1',
                                        'us-east-2',
                                        'us-west-1',
                                        'us-west-2',
                                      ],
                                      nullable: true,
                                    },
                                    role_arn: { type: 'string', nullable: true },
                                    usage_plan_id: { type: 'string', nullable: true },
                                  },
                                  required: ['external_id', 'region', 'role_arn', 'usage_plan_id'],
                                  additionalProperties: false,
                                },
                              },
                              required: ['readme_webhook_login'],
                              additionalProperties: false,
                            },
                            bing: {
                              type: 'object',
                              properties: { verify: { type: 'string', nullable: true } },
                              required: ['verify'],
                              additionalProperties: false,
                            },
                            google: {
                              type: 'object',
                              properties: {
                                analytics: {
                                  type: 'string',
                                  nullable: true,
                                  description:
                                    "Your Google Analytics ID. If it starts with UA-, we'll use Universal Analytics otherwise Google Analytics 4.",
                                },
                                site_verification: { type: 'string', nullable: true },
                              },
                              required: ['analytics', 'site_verification'],
                              additionalProperties: false,
                            },
                            heap: {
                              type: 'object',
                              properties: { id: { type: 'string', nullable: true } },
                              required: ['id'],
                              additionalProperties: false,
                            },
                            intercom: {
                              type: 'object',
                              properties: {
                                app_id: { type: 'string', nullable: true },
                                secure_mode: {
                                  type: 'object',
                                  properties: {
                                    key: {
                                      type: 'string',
                                      nullable: true,
                                      description:
                                        'By supplying a secure mode key you will opt into [Intercoms Identity Verification](https://docs.intercom.io/configuring-intercom/enable-secure-mode) system.',
                                    },
                                    email_only: {
                                      type: 'boolean',
                                      default: false,
                                      description:
                                        'Should ReadMe only identify users by their email addresses? This integrates better with your existing Intercom but is possibly less secure.',
                                    },
                                  },
                                  required: ['key'],
                                  additionalProperties: false,
                                },
                              },
                              required: ['app_id', 'secure_mode'],
                              additionalProperties: false,
                            },
                            koala: {
                              type: 'object',
                              properties: { key: { type: 'string', nullable: true } },
                              required: ['key'],
                              additionalProperties: false,
                            },
                            localize: {
                              type: 'object',
                              properties: { key: { type: 'string', nullable: true } },
                              required: ['key'],
                              additionalProperties: false,
                            },
                            recaptcha: {
                              type: 'object',
                              properties: {
                                site_key: { type: 'string', nullable: true },
                                secret_key: { type: 'string', nullable: true },
                              },
                              required: ['site_key', 'secret_key'],
                              additionalProperties: false,
                              description: 'https://docs.readme.com/main/docs/recaptcha',
                            },
                            segment: {
                              type: 'object',
                              properties: {
                                key: { type: 'string', nullable: true },
                                domain: {
                                  type: 'string',
                                  nullable: true,
                                  description:
                                    'If you are proxying [Segment](https://segment.com/) requests through a custom domain this is that domain. More information about this configuration can be found [here](https://docs.readme.com/main/docs/segment#using-a-custom-domain-with-segment).',
                                },
                              },
                              required: ['key', 'domain'],
                              additionalProperties: false,
                            },
                            typekit: {
                              type: 'object',
                              properties: { key: { type: 'string', nullable: true } },
                              required: ['key'],
                              additionalProperties: false,
                            },
                            zendesk: {
                              type: 'object',
                              properties: { subdomain: { type: 'string', nullable: true } },
                              required: ['subdomain'],
                              additionalProperties: false,
                            },
                          },
                          required: [
                            'aws',
                            'bing',
                            'google',
                            'heap',
                            'intercom',
                            'koala',
                            'localize',
                            'recaptcha',
                            'segment',
                            'typekit',
                            'zendesk',
                          ],
                          additionalProperties: false,
                        },
                        name: { type: 'string', description: 'The name of the project.' },
                        onboarding_completed: {
                          type: 'object',
                          properties: {
                            api: { type: 'boolean', default: false },
                            appearance: { type: 'boolean', default: false },
                            documentation: { type: 'boolean', default: false },
                            domain: { type: 'boolean', default: false },
                            jwt: { type: 'boolean', default: false },
                            logs: { type: 'boolean', default: false },
                            metricsSDK: { type: 'boolean', default: false },
                          },
                          additionalProperties: false,
                        },
                        pages: {
                          type: 'object',
                          properties: {
                            not_found: {
                              type: 'string',
                              pattern:
                                '\\/versions\\/(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)\\/custom_pages\\/([a-f\\d]{24}|([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                              nullable: true,
                              description:
                                'The page you wish to be served to your users when they encounter a 404. This can either map to the `uri` of a Custom Page on your project or be set to `null`. If `null` then the default ReadMe 404 page will be served. The version within the `uri` must be mapped to your stable version.',
                            },
                          },
                          required: ['not_found'],
                          additionalProperties: false,
                        },
                        parent: {
                          type: 'string',
                          nullable: true,
                          description:
                            "Does the project have a parent project (enterprise)? If so, this resolves to the parent's subdomain.",
                        },
                        plan: {
                          type: 'object',
                          properties: {
                            type: {
                              type: 'string',
                              enum: [
                                'business',
                                'business2018',
                                'business-annual-2024',
                                'enterprise',
                                'free',
                                'freelaunch',
                                'opensource',
                                'startup',
                                'startup2018',
                                'startup-annual-2024',
                              ],
                              default: 'free',
                            },
                            grace_period: {
                              type: 'object',
                              properties: {
                                enabled: { type: 'boolean', default: false },
                                end_date: { type: 'string', format: 'date-time', nullable: true, default: null },
                              },
                              additionalProperties: false,
                            },
                            trial: {
                              type: 'object',
                              properties: {
                                expired: { type: 'boolean', default: false },
                                end_date: {
                                  type: 'string',
                                  format: 'date-time',
                                  description: 'The end date for your two week trial.',
                                },
                              },
                              required: ['end_date'],
                              additionalProperties: false,
                            },
                          },
                          required: ['grace_period', 'trial'],
                          additionalProperties: false,
                        },
                        privacy: {
                          type: 'object',
                          properties: {
                            view: {
                              type: 'string',
                              enum: ['public', 'admin', 'password', 'custom_login'],
                              default: 'public',
                              description:
                                '* `public` - Site is available to the public.\n* `admin` - Site is only available to users that have project permissions.\n* `password` - Site is gated behind a password authentication system.\n* `custom_login` - Users who view your site will be forwarded to a URL of your choice, having them login there and be forwarded back to your ReadMe site.',
                            },
                            password: {
                              type: 'string',
                              nullable: true,
                              description:
                                "The project's password for when `privacy.view` is `password`. This field can be set, but it will not be returned by the API.",
                            },
                          },
                          required: ['password'],
                          additionalProperties: false,
                        },
                        redirects: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: { from: { type: 'string' }, to: { type: 'string' } },
                            required: ['from', 'to'],
                            additionalProperties: false,
                          },
                          description:
                            'A collection of page redirects that ReadMe will permanently redirect users to when attempting to render a 404. Check out our [redirect docs](https://docs.readme.com/main/docs/error-pages#section-redirects) for more information on how they are handled.',
                        },
                        reference: {
                          type: 'object',
                          properties: {
                            api_sdk_snippets: {
                              type: 'string',
                              enum: ['enabled', 'disabled'],
                              default: 'enabled',
                              description: 'Enable SDK-generated request code snippets.',
                            },
                            defaults: {
                              type: 'string',
                              enum: ['always_use', 'use_only_if_required'],
                              default: 'use_only_if_required',
                              description:
                                'When `always_use`, any `default` values defined in your API definition are used to populate your request data in the API Explorer, even if the parameter is not marked as `required`.',
                            },
                            json_editor: {
                              type: 'string',
                              enum: ['enabled', 'disabled'],
                              default: 'disabled',
                              description: 'When `enabled`, allows editing the request body with a JSON editor.',
                            },
                            request_history: {
                              type: 'string',
                              enum: ['enabled', 'disabled'],
                              default: 'enabled',
                              description: 'When `enabled`, request history for API endpoints are shown.',
                            },
                            oauth_flows: {
                              type: 'string',
                              enum: ['enabled', 'disabled'],
                              default: 'disabled',
                              description:
                                'When `enabled`, enable the new OAuth Flows experience in the API Reference section.',
                            },
                            response_examples: {
                              type: 'string',
                              enum: ['expanded', 'collapsed'],
                              default: 'collapsed',
                              description:
                                'When `expanded`, response examples will be expanded by default if a 200 level response exists.',
                            },
                            response_schemas: {
                              type: 'string',
                              enum: ['expanded', 'collapsed'],
                              default: 'collapsed',
                              description:
                                'When `expanded`, response schemas will be expanded by default if a 200 level response schema exists.',
                            },
                          },
                          additionalProperties: false,
                          description:
                            'Contains options to configure interactive sections on your API Reference pages.',
                        },
                        seo: {
                          type: 'object',
                          properties: {
                            overwrite_title_tag: {
                              type: 'string',
                              enum: ['enabled', 'disabled'],
                              default: 'disabled',
                              description:
                                "Overwrite pages' <title> tag with their custom metadata title (if present).",
                            },
                          },
                          additionalProperties: false,
                        },
                        sitemap: {
                          type: 'string',
                          enum: ['enabled', 'disabled'],
                          default: 'disabled',
                          description: 'Expose a `sitemap.xml` directory on your project.',
                        },
                        subdomain: {
                          type: 'string',
                          pattern: '[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*',
                          maxLength: 30,
                          description: 'The subdomain of your project.',
                        },
                        suggested_edits: {
                          type: 'string',
                          enum: ['enabled', 'disabled'],
                          default: 'enabled',
                          description: 'Allow users to suggest edits to your documentation.',
                        },
                        variable_defaults: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: { type: 'string', description: 'Variable Identifier' },
                              name: { type: 'string', description: 'The key name of the variable.' },
                              default: { type: 'string', description: 'The default value of the variable.' },
                              source: {
                                type: 'string',
                                enum: ['server', 'security', 'custom', ''],
                                default: '',
                                description:
                                  'The variables source. This can come from a user input or from syncing an OpenAPI definition.',
                              },
                              type: {
                                type: 'string',
                                enum: ['http', 'apiKey', 'openIdConnect', 'oauth2', ''],
                                description:
                                  'If variable `source` is `security`, include the OpenAPI security auth type.',
                              },
                              scheme: {
                                type: 'string',
                                description:
                                  'If variable `source` is `security`, include the OpenAPI security auth scheme.',
                              },
                            },
                            required: ['id', 'name'],
                            additionalProperties: false,
                          },
                          default: [],
                        },
                        webhooks: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              action: { type: 'string', enum: ['login'], default: 'login' },
                              timeout: { type: 'number', default: 5000 },
                              url: { type: 'string', format: 'uri' },
                            },
                            required: ['url'],
                            additionalProperties: false,
                          },
                          default: [],
                        },
                        id: {
                          type: 'string',
                          pattern: '^[a-f\\d]{24}$',
                          description: 'The unique, immutable, identifier for the project.',
                        },
                        features: {
                          type: 'object',
                          properties: {
                            mdx: {
                              type: 'string',
                              enum: ['enabled', 'disabled'],
                              default: 'disabled',
                              description: 'If this project supports MDX.',
                            },
                          },
                          additionalProperties: false,
                        },
                        git: {
                          type: 'object',
                          properties: {
                            connection: {
                              type: 'object',
                              properties: {
                                repository: {
                                  type: 'object',
                                  properties: {
                                    provider_type: {
                                      type: 'string',
                                      enum: ['github', 'github_enterprise_server'],
                                      description: 'The type of provider for the repository.',
                                    },
                                    name: {
                                      type: 'string',
                                      description: 'The name of the repository (e.g., `repo-with-content`).',
                                    },
                                    full_name: {
                                      type: 'string',
                                      description:
                                        'The full name of the repository (e.g., `owner-org/repo-with-content`).',
                                    },
                                    url: {
                                      type: 'string',
                                      format: 'uri',
                                      description:
                                        'The URL of the repository (e.g., `https://github.com/owner-org/repo-with-content`).',
                                    },
                                  },
                                  required: ['provider_type', 'name', 'full_name', 'url'],
                                  additionalProperties: false,
                                  nullable: true,
                                },
                                status: {
                                  type: 'string',
                                  enum: ['active', 'inactive', 'none'],
                                  default: 'none',
                                  description:
                                    'Indicates if the project has a bi-directional sync connection set up. Below is the meaning of each possible value:\n- `active` - the project has an external repository connected and the connection to the repository is active.\n- `inactive` - the project has an external repository connected but the connection to the repository is inactive.\n- `none` - the project is not connected to an external repository.',
                                },
                              },
                              required: ['repository'],
                              additionalProperties: false,
                            },
                          },
                          required: ['connection'],
                          additionalProperties: false,
                        },
                        permissions: {
                          type: 'object',
                          properties: {
                            appearance: {
                              type: 'object',
                              properties: {
                                private_label: {
                                  type: 'string',
                                  enum: ['enabled', 'disabled'],
                                  default: 'disabled',
                                  description:
                                    'If this project is allowed to private label their Hub and remove all ReadMe branding.',
                                },
                                custom_code: {
                                  type: 'object',
                                  properties: {
                                    css: {
                                      type: 'string',
                                      enum: ['enabled', 'disabled'],
                                      default: 'disabled',
                                      description: 'If this project is allowed to utilize custom CSS.',
                                    },
                                    html: {
                                      type: 'string',
                                      enum: ['enabled', 'disabled'],
                                      default: 'disabled',
                                      description: 'If this project is allowed to utilize custom HTML.',
                                    },
                                    js: {
                                      type: 'string',
                                      enum: ['enabled', 'disabled'],
                                      default: 'disabled',
                                      description: 'If this project is allowed to utilize custom JS.',
                                    },
                                  },
                                  additionalProperties: false,
                                },
                              },
                              required: ['custom_code'],
                              additionalProperties: false,
                            },
                          },
                          required: ['appearance'],
                          additionalProperties: false,
                        },
                        refactored: {
                          type: 'object',
                          properties: {
                            status: {
                              type: 'string',
                              enum: ['enabled', 'disabled'],
                              default: 'disabled',
                              description: 'Indicates if the project has our new Unified UI experience.',
                            },
                            migrated: {
                              type: 'string',
                              enum: ['failed', 'processing', 'successful', 'unknown'],
                              default: 'unknown',
                              description: 'Indicates if the project has been migrated from Dash to Superhub.',
                            },
                          },
                          additionalProperties: false,
                        },
                        uri: {
                          type: 'string',
                          pattern: '\\/projects\\/(me|[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*)',
                          description: 'A URI to the project resource.',
                        },
                      },
                      required: [
                        'api_designer',
                        'appearance',
                        'canonical_url',
                        'custom_login',
                        'default_version',
                        'description',
                        'health_check',
                        'homepage_url',
                        'integrations',
                        'name',
                        'onboarding_completed',
                        'pages',
                        'parent',
                        'plan',
                        'privacy',
                        'redirects',
                        'reference',
                        'seo',
                        'subdomain',
                        'id',
                        'features',
                        'git',
                        'permissions',
                        'refactored',
                        'uri',
                      ],
                      additionalProperties: false,
                    },
                  },
                  required: ['data'],
                  additionalProperties: false,
                },
              },
            },
          },
        },
      },
    },
    '/versions/{version}/reference': {
      post: {
        operationId: 'createReference',
        summary: 'Create a reference page',
        tags: ['API Reference'],
        description:
          "Create a page in the API Reference section of your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).\n\n>🚧 ReadMe's API v2 is currently in beta.\n >This API and its documentation are a work in progress. While we don't expect any major breaking changes, you may encounter occasional issues as we work toward a stable release. Make sure to [check out our API migration guide](https://docs.readme.com/main/reference/api-migration-guide), and [feel free to reach out](mailto:support@readme.io) if you have any questions or feedback!",
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  allow_crawlers: {
                    type: 'string',
                    enum: ['enabled', 'disabled'],
                    default: 'enabled',
                    description: 'Allow indexing by robots.',
                  },
                  category: {
                    type: 'object',
                    properties: {
                      uri: {
                        type: 'string',
                        pattern:
                          '\\/versions\\/(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)\\/categories\\/(guides|reference)\\/((.*))',
                        description: 'A URI to the category resource.',
                      },
                    },
                    required: ['uri'],
                    additionalProperties: false,
                  },
                  content: {
                    type: 'object',
                    properties: {
                      body: { type: 'string', nullable: true },
                      excerpt: { type: 'string', nullable: true },
                      link: {
                        type: 'object',
                        properties: {
                          url: { type: 'string', nullable: true },
                          new_tab: { type: 'boolean', nullable: true },
                        },
                        additionalProperties: false,
                        description:
                          'Information about where this page should redirect to; only available when `type` is `link`.',
                      },
                      next: {
                        type: 'object',
                        properties: {
                          description: { type: 'string', nullable: true },
                          pages: {
                            type: 'array',
                            items: {
                              anyOf: [
                                {
                                  type: 'object',
                                  properties: {
                                    slug: { type: 'string' },
                                    title: { type: 'string', nullable: true },
                                    type: { type: 'string', enum: ['basic', 'endpoint'] },
                                  },
                                  required: ['slug', 'title', 'type'],
                                  additionalProperties: false,
                                },
                                {
                                  type: 'object',
                                  properties: {
                                    title: { type: 'string', nullable: true },
                                    type: { type: 'string', enum: ['link'] },
                                    url: { type: 'string' },
                                  },
                                  required: ['title', 'type', 'url'],
                                  additionalProperties: false,
                                },
                              ],
                            },
                          },
                        },
                        additionalProperties: false,
                      },
                    },
                    additionalProperties: false,
                  },
                  href: {
                    type: 'object',
                    properties: {
                      dash: { type: 'string', format: 'uri', description: 'A URL to this page in your ReadMe Dash.' },
                      hub: { type: 'string', format: 'uri', description: 'A URL to this page on your ReadMe hub.' },
                    },
                    additionalProperties: false,
                  },
                  metadata: {
                    type: 'object',
                    properties: {
                      description: { type: 'string', nullable: true },
                      keywords: { type: 'string', nullable: true },
                      title: { type: 'string', nullable: true },
                      image: {
                        type: 'object',
                        properties: { uri: { type: 'string', pattern: '\\/images\\/([a-f\\d]{24})', nullable: true } },
                        additionalProperties: false,
                      },
                    },
                    additionalProperties: false,
                  },
                  parent: {
                    type: 'object',
                    properties: {
                      uri: {
                        type: 'string',
                        pattern:
                          '\\/versions\\/(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)\\/(guides|reference)\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                        nullable: true,
                      },
                    },
                    additionalProperties: false,
                  },
                  privacy: {
                    type: 'object',
                    properties: {
                      view: { type: 'string', enum: ['public', 'anyone_with_link'], default: 'anyone_with_link' },
                    },
                    additionalProperties: false,
                  },
                  renderable: {
                    type: 'object',
                    properties: {
                      status: {
                        type: 'boolean',
                        default: true,
                        description: 'A flag for if the page is renderable or not.',
                      },
                      error: { type: 'string', nullable: true },
                      message: { type: 'string', nullable: true },
                    },
                    additionalProperties: false,
                  },
                  slug: {
                    allOf: [{ type: 'string' }, { type: 'string', minLength: 1 }],
                    description: 'The accessible URL slug for the page.',
                  },
                  state: { type: 'string', enum: ['current', 'deprecated'], default: 'current' },
                  title: { type: 'string' },
                  type: {
                    type: 'string',
                    enum: ['api_config', 'basic', 'endpoint', 'link', 'webhook'],
                    default: 'basic',
                  },
                  connections: {
                    type: 'object',
                    properties: {
                      recipes: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            uri: {
                              type: 'string',
                              pattern:
                                '\\/versions\\/(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)\\/recipes\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                              description:
                                'URI of the recipe that this API reference is connected to. The recipe and API reference must exist within the same version.',
                            },
                          },
                          additionalProperties: false,
                        },
                        nullable: true,
                      },
                    },
                    additionalProperties: false,
                  },
                  position: { type: 'number' },
                  api_config: {
                    type: 'string',
                    enum: ['authentication', 'getting-started', 'my-requests'],
                    nullable: true,
                  },
                  api: {
                    type: 'object',
                    properties: {
                      method: {
                        type: 'string',
                        enum: ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'],
                        description: 'The endpoint HTTP method.',
                      },
                      path: { type: 'string', description: 'The endpoint path.' },
                      schema: { nullable: true },
                      stats: {
                        type: 'object',
                        properties: {
                          additional_properties: {
                            type: 'boolean',
                            default: false,
                            description:
                              'This API operation uses `additionalProperties` for handling extra schema properties.',
                          },
                          callbacks: {
                            type: 'boolean',
                            default: false,
                            description: 'This API operation has `callbacks` documented.',
                          },
                          circular_references: {
                            type: 'boolean',
                            default: false,
                            description: 'This API operation contains `$ref` schema pointers that resolve to itself.',
                          },
                          common_parameters: {
                            type: 'boolean',
                            default: false,
                            description: 'This API operation utilizes common parameters set at the path level.',
                          },
                          discriminators: {
                            type: 'boolean',
                            default: false,
                            description:
                              'This API operation utilizes `discriminator` for discriminating between different parts in a polymorphic schema.',
                          },
                          links: {
                            type: 'boolean',
                            default: false,
                            description: 'This API operation has `links` documented.',
                          },
                          polymorphism: {
                            type: 'boolean',
                            default: false,
                            description: 'This API operation contains polymorphic schemas.',
                          },
                          server_variables: {
                            type: 'boolean',
                            default: false,
                            description:
                              'This API operation has composable variables configured for its server definition.',
                          },
                          style: {
                            type: 'boolean',
                            default: false,
                            description: 'This API operation has parameters that have specific `style` serializations.',
                          },
                          webhooks: {
                            type: 'boolean',
                            default: false,
                            description: 'This API definition has `webhooks` documented.',
                          },
                          xml: {
                            type: 'boolean',
                            default: false,
                            description: 'This API operation has parameters or schemas that serialize to XML.',
                          },
                          references: {
                            type: 'boolean',
                            description:
                              'This API operation, after being dereferenced, has `x-readme-ref-name` entries defining what the original `$ref` schema pointers were named.',
                          },
                        },
                        additionalProperties: false,
                        description: 'OpenAPI features that are utilized within this API operation.',
                      },
                      source: {
                        type: 'string',
                        enum: [
                          'api',
                          'apidesigner',
                          'apieditor',
                          'bidi',
                          'form',
                          'postman',
                          'rdme',
                          'rdme_github',
                          'url',
                        ],
                        nullable: true,
                      },
                      uri: {
                        type: 'string',
                        pattern:
                          '\\/versions\\/(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)\\/apis\\/((([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+.(json|yaml|yml)))',
                        nullable: true,
                      },
                    },
                    additionalProperties: false,
                  },
                },
                required: ['category', 'title'],
                additionalProperties: false,
              },
            },
          },
          required: true,
        },
        parameters: [
          {
            schema: { type: 'string', pattern: 'stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?' },
            in: 'path',
            name: 'version',
            required: true,
            description: 'Project version number or `stable` for your stable project version.',
          },
        ],
        responses: {
          '201': {
            description: 'Created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        allow_crawlers: {
                          type: 'string',
                          enum: ['enabled', 'disabled'],
                          default: 'enabled',
                          description: 'Allow indexing by robots.',
                        },
                        category: {
                          type: 'object',
                          properties: {
                            uri: {
                              type: 'string',
                              pattern:
                                '\\/versions\\/(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)\\/categories\\/(guides|reference)\\/((.*))',
                              description: 'A URI to the category resource.',
                            },
                          },
                          required: ['uri'],
                          additionalProperties: false,
                        },
                        content: {
                          type: 'object',
                          properties: {
                            body: { type: 'string', nullable: true },
                            excerpt: { type: 'string', nullable: true },
                            link: {
                              type: 'object',
                              properties: {
                                url: { type: 'string', nullable: true },
                                new_tab: {
                                  type: 'boolean',
                                  nullable: true,
                                  description: 'Should this URL be opened up in a new tab?',
                                },
                              },
                              required: ['url', 'new_tab'],
                              additionalProperties: false,
                              description:
                                'Information about where this page should redirect to; only available when `type` is `link`.',
                            },
                            next: {
                              type: 'object',
                              properties: {
                                description: { type: 'string', nullable: true },
                                pages: {
                                  type: 'array',
                                  items: {
                                    anyOf: [
                                      {
                                        type: 'object',
                                        properties: {
                                          slug: { type: 'string' },
                                          title: { type: 'string', nullable: true },
                                          type: { type: 'string', enum: ['basic', 'endpoint'] },
                                        },
                                        required: ['slug', 'title', 'type'],
                                        additionalProperties: false,
                                      },
                                      {
                                        type: 'object',
                                        properties: {
                                          title: { type: 'string', nullable: true },
                                          type: { type: 'string', enum: ['link'] },
                                          url: { type: 'string' },
                                        },
                                        required: ['title', 'type', 'url'],
                                        additionalProperties: false,
                                      },
                                    ],
                                  },
                                },
                              },
                              required: ['description', 'pages'],
                              additionalProperties: false,
                            },
                          },
                          required: ['body', 'excerpt', 'link', 'next'],
                          additionalProperties: false,
                        },
                        href: {
                          type: 'object',
                          properties: {
                            dash: {
                              type: 'string',
                              format: 'uri',
                              description: 'A URL to this page in your ReadMe Dash.',
                            },
                            hub: {
                              type: 'string',
                              format: 'uri',
                              description: 'A URL to this page on your ReadMe hub.',
                            },
                          },
                          required: ['dash', 'hub'],
                          additionalProperties: false,
                        },
                        metadata: {
                          type: 'object',
                          properties: {
                            description: { type: 'string', nullable: true },
                            image: {
                              type: 'object',
                              properties: {
                                uri: {
                                  type: 'string',
                                  pattern: '\\/images\\/([a-f\\d]{24})',
                                  nullable: true,
                                  description:
                                    'A URI to the `getImages` endpoint for this image. If the is a legacy image then this `uri` will be `null`. And if you wish to delete this image then you should set this to `null`.',
                                },
                                url: { type: 'string', format: 'uri', nullable: true },
                              },
                              required: ['uri', 'url'],
                              additionalProperties: false,
                            },
                            keywords: {
                              type: 'string',
                              nullable: true,
                              description: 'A comma-separated list of keywords to place into your page metadata.',
                            },
                            title: { type: 'string', nullable: true },
                          },
                          required: ['description', 'image', 'keywords', 'title'],
                          additionalProperties: false,
                        },
                        parent: {
                          type: 'object',
                          properties: {
                            uri: {
                              type: 'string',
                              pattern:
                                '\\/versions\\/(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)\\/(guides|reference)\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                              nullable: true,
                              description: 'A URI to the parent page resource including the page ID or slug.',
                            },
                          },
                          required: ['uri'],
                          additionalProperties: false,
                        },
                        privacy: {
                          type: 'object',
                          properties: {
                            view: { type: 'string', enum: ['public', 'anyone_with_link'], default: 'anyone_with_link' },
                          },
                          additionalProperties: false,
                        },
                        project: {
                          type: 'object',
                          properties: {
                            name: { type: 'string', description: 'The name of the project.' },
                            subdomain: {
                              type: 'string',
                              pattern: '[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*',
                              maxLength: 30,
                              description: 'The subdomain of the project.',
                            },
                            uri: {
                              type: 'string',
                              pattern: '\\/projects\\/(me|[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*)',
                              description: 'A URI to the project that this page belongs to.',
                            },
                          },
                          required: ['name', 'subdomain', 'uri'],
                          additionalProperties: false,
                        },
                        renderable: {
                          type: 'object',
                          properties: {
                            status: {
                              type: 'boolean',
                              default: true,
                              description: 'A flag for if the page is renderable or not.',
                            },
                            error: { type: 'string', nullable: true, description: 'The rendering error.' },
                            message: {
                              type: 'string',
                              nullable: true,
                              description: 'Additional details about the rendering error.',
                            },
                          },
                          additionalProperties: false,
                        },
                        slug: {
                          allOf: [{ type: 'string' }, { type: 'string', minLength: 1 }],
                          description: 'The accessible URL slug for the page.',
                        },
                        state: { type: 'string', enum: ['current', 'deprecated'], default: 'current' },
                        title: { type: 'string' },
                        type: {
                          type: 'string',
                          enum: ['api_config', 'basic', 'endpoint', 'link', 'webhook'],
                          default: 'basic',
                        },
                        updated_at: {
                          type: 'string',
                          format: 'date-time',
                          description: 'An ISO 8601 formatted date for when the page was updated.',
                        },
                        uri: {
                          type: 'string',
                          pattern:
                            '\\/versions\\/(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)\\/(guides|reference)\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                          description: 'A URI to the page resource.',
                        },
                        api_config: {
                          type: 'string',
                          enum: ['authentication', 'getting-started', 'my-requests'],
                          nullable: true,
                        },
                        api: {
                          type: 'object',
                          properties: {
                            method: {
                              type: 'string',
                              enum: ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'],
                              description: 'The endpoint HTTP method.',
                            },
                            path: { type: 'string', description: 'The endpoint path.' },
                            schema: {
                              nullable: true,
                              description:
                                'The API schema for this reference endpoint. This schema may be a reduced (i.e., only contains the necessary information for this endpoint) and/or dereferenced version of the full API definition, depending upon the query parameters used for this request.',
                            },
                            stats: {
                              type: 'object',
                              properties: {
                                additional_properties: {
                                  type: 'boolean',
                                  default: false,
                                  description:
                                    'This API operation uses `additionalProperties` for handling extra schema properties.',
                                },
                                callbacks: {
                                  type: 'boolean',
                                  default: false,
                                  description: 'This API operation has `callbacks` documented.',
                                },
                                circular_references: {
                                  type: 'boolean',
                                  default: false,
                                  description:
                                    'This API operation contains `$ref` schema pointers that resolve to itself.',
                                },
                                common_parameters: {
                                  type: 'boolean',
                                  default: false,
                                  description: 'This API operation utilizes common parameters set at the path level.',
                                },
                                discriminators: {
                                  type: 'boolean',
                                  default: false,
                                  description:
                                    'This API operation utilizes `discriminator` for discriminating between different parts in a polymorphic schema.',
                                },
                                links: {
                                  type: 'boolean',
                                  default: false,
                                  description: 'This API operation has `links` documented.',
                                },
                                polymorphism: {
                                  type: 'boolean',
                                  default: false,
                                  description: 'This API operation contains polymorphic schemas.',
                                },
                                server_variables: {
                                  type: 'boolean',
                                  default: false,
                                  description:
                                    'This API operation has composable variables configured for its server definition.',
                                },
                                style: {
                                  type: 'boolean',
                                  default: false,
                                  description:
                                    'This API operation has parameters that have specific `style` serializations.',
                                },
                                webhooks: {
                                  type: 'boolean',
                                  default: false,
                                  description: 'This API definition has `webhooks` documented.',
                                },
                                xml: {
                                  type: 'boolean',
                                  default: false,
                                  description: 'This API operation has parameters or schemas that serialize to XML.',
                                },
                                references: {
                                  type: 'boolean',
                                  description:
                                    'This API operation, after being dereferenced, has `x-readme-ref-name` entries defining what the original `$ref` schema pointers were named.',
                                },
                              },
                              required: ['references'],
                              additionalProperties: false,
                              description: 'OpenAPI features that are utilized within this API operation.',
                            },
                            source: {
                              type: 'string',
                              enum: [
                                'api',
                                'apidesigner',
                                'apieditor',
                                'bidi',
                                'form',
                                'postman',
                                'rdme',
                                'rdme_github',
                                'url',
                              ],
                              nullable: true,
                              description: 'The source by which this API definition was ingested.',
                            },
                            uri: {
                              type: 'string',
                              pattern:
                                '\\/versions\\/(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)\\/apis\\/((([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+.(json|yaml|yml)))',
                              nullable: true,
                              description: 'A URI to the API resource.',
                            },
                          },
                          required: ['method', 'path', 'stats', 'source', 'uri'],
                          additionalProperties: false,
                          description: 'Information about the API that this reference page is attached to.',
                        },
                        connections: {
                          type: 'object',
                          properties: {
                            recipes: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  uri: {
                                    type: 'string',
                                    pattern:
                                      '\\/versions\\/(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)\\/recipes\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                                    description:
                                      'URI of the recipe that this API reference is connected to. The recipe and API reference must exist within the same version.',
                                  },
                                },
                                required: ['uri'],
                                additionalProperties: false,
                              },
                              nullable: true,
                              description: 'A collection of recipes that are displayed on this API reference.',
                            },
                          },
                          required: ['recipes'],
                          additionalProperties: false,
                        },
                      },
                      required: [
                        'category',
                        'content',
                        'href',
                        'metadata',
                        'parent',
                        'privacy',
                        'project',
                        'renderable',
                        'slug',
                        'title',
                        'updated_at',
                        'uri',
                        'api_config',
                        'api',
                        'connections',
                      ],
                      additionalProperties: false,
                    },
                  },
                  required: ['data'],
                  additionalProperties: false,
                },
              },
            },
          },
        },
      },
    },
    '/versions/{version}/reference/{slug}': {
      get: {
        operationId: 'getReference',
        summary: 'Get a reference page',
        tags: ['API Reference'],
        description:
          "Get a page from the API Reference section of your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).\n\n>🚧 ReadMe's API v2 is currently in beta.\n >This API and its documentation are a work in progress. While we don't expect any major breaking changes, you may encounter occasional issues as we work toward a stable release. Make sure to [check out our API migration guide](https://docs.readme.com/main/reference/api-migration-guide), and [feel free to reach out](mailto:support@readme.io) if you have any questions or feedback!",
        parameters: [
          {
            schema: { type: 'string', enum: ['true', 'false'], default: 'false' },
            in: 'query',
            name: 'dereference',
            required: false,
            description:
              'Whether or not to dereference the attached API definition. Defaults to `false` if not specified (subject to change while API v2 is still in beta).',
          },
          {
            schema: { type: 'string', enum: ['true', 'false'], default: 'true' },
            in: 'query',
            name: 'reduce',
            required: false,
            description:
              'Whether or not to reduce the attached API definition. Defaults to `true` if not specified (subject to change while API v2 is still in beta).',
          },
          {
            schema: { type: 'string', pattern: 'stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?' },
            in: 'path',
            name: 'version',
            required: true,
            description: 'Project version number or `stable` for your stable project version.',
          },
          {
            schema: { type: 'string', pattern: '([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+' },
            in: 'path',
            name: 'slug',
            required: true,
            description: 'A URL-safe representation of the resource.',
          },
        ],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        allow_crawlers: {
                          type: 'string',
                          enum: ['enabled', 'disabled'],
                          default: 'enabled',
                          description: 'Allow indexing by robots.',
                        },
                        category: {
                          type: 'object',
                          properties: {
                            uri: {
                              type: 'string',
                              pattern:
                                '\\/versions\\/(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)\\/categories\\/(guides|reference)\\/((.*))',
                              description: 'A URI to the category resource.',
                            },
                          },
                          required: ['uri'],
                          additionalProperties: false,
                        },
                        content: {
                          type: 'object',
                          properties: {
                            body: { type: 'string', nullable: true },
                            excerpt: { type: 'string', nullable: true },
                            link: {
                              type: 'object',
                              properties: {
                                url: { type: 'string', nullable: true },
                                new_tab: {
                                  type: 'boolean',
                                  nullable: true,
                                  description: 'Should this URL be opened up in a new tab?',
                                },
                              },
                              required: ['url', 'new_tab'],
                              additionalProperties: false,
                              description:
                                'Information about where this page should redirect to; only available when `type` is `link`.',
                            },
                            next: {
                              type: 'object',
                              properties: {
                                description: { type: 'string', nullable: true },
                                pages: {
                                  type: 'array',
                                  items: {
                                    anyOf: [
                                      {
                                        type: 'object',
                                        properties: {
                                          slug: { type: 'string' },
                                          title: { type: 'string', nullable: true },
                                          type: { type: 'string', enum: ['basic', 'endpoint'] },
                                        },
                                        required: ['slug', 'title', 'type'],
                                        additionalProperties: false,
                                      },
                                      {
                                        type: 'object',
                                        properties: {
                                          title: { type: 'string', nullable: true },
                                          type: { type: 'string', enum: ['link'] },
                                          url: { type: 'string' },
                                        },
                                        required: ['title', 'type', 'url'],
                                        additionalProperties: false,
                                      },
                                    ],
                                  },
                                },
                              },
                              required: ['description', 'pages'],
                              additionalProperties: false,
                            },
                          },
                          required: ['body', 'excerpt', 'link', 'next'],
                          additionalProperties: false,
                        },
                        href: {
                          type: 'object',
                          properties: {
                            dash: {
                              type: 'string',
                              format: 'uri',
                              description: 'A URL to this page in your ReadMe Dash.',
                            },
                            hub: {
                              type: 'string',
                              format: 'uri',
                              description: 'A URL to this page on your ReadMe hub.',
                            },
                          },
                          required: ['dash', 'hub'],
                          additionalProperties: false,
                        },
                        metadata: {
                          type: 'object',
                          properties: {
                            description: { type: 'string', nullable: true },
                            image: {
                              type: 'object',
                              properties: {
                                uri: {
                                  type: 'string',
                                  pattern: '\\/images\\/([a-f\\d]{24})',
                                  nullable: true,
                                  description:
                                    'A URI to the `getImages` endpoint for this image. If the is a legacy image then this `uri` will be `null`. And if you wish to delete this image then you should set this to `null`.',
                                },
                                url: { type: 'string', format: 'uri', nullable: true },
                              },
                              required: ['uri', 'url'],
                              additionalProperties: false,
                            },
                            keywords: {
                              type: 'string',
                              nullable: true,
                              description: 'A comma-separated list of keywords to place into your page metadata.',
                            },
                            title: { type: 'string', nullable: true },
                          },
                          required: ['description', 'image', 'keywords', 'title'],
                          additionalProperties: false,
                        },
                        parent: {
                          type: 'object',
                          properties: {
                            uri: {
                              type: 'string',
                              pattern:
                                '\\/versions\\/(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)\\/(guides|reference)\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                              nullable: true,
                              description: 'A URI to the parent page resource including the page ID or slug.',
                            },
                          },
                          required: ['uri'],
                          additionalProperties: false,
                        },
                        privacy: {
                          type: 'object',
                          properties: {
                            view: { type: 'string', enum: ['public', 'anyone_with_link'], default: 'anyone_with_link' },
                          },
                          additionalProperties: false,
                        },
                        project: {
                          type: 'object',
                          properties: {
                            name: { type: 'string', description: 'The name of the project.' },
                            subdomain: {
                              type: 'string',
                              pattern: '[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*',
                              maxLength: 30,
                              description: 'The subdomain of the project.',
                            },
                            uri: {
                              type: 'string',
                              pattern: '\\/projects\\/(me|[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*)',
                              description: 'A URI to the project that this page belongs to.',
                            },
                          },
                          required: ['name', 'subdomain', 'uri'],
                          additionalProperties: false,
                        },
                        renderable: {
                          type: 'object',
                          properties: {
                            status: {
                              type: 'boolean',
                              default: true,
                              description: 'A flag for if the page is renderable or not.',
                            },
                            error: { type: 'string', nullable: true, description: 'The rendering error.' },
                            message: {
                              type: 'string',
                              nullable: true,
                              description: 'Additional details about the rendering error.',
                            },
                          },
                          additionalProperties: false,
                        },
                        slug: {
                          allOf: [{ type: 'string' }, { type: 'string', minLength: 1 }],
                          description: 'The accessible URL slug for the page.',
                        },
                        state: { type: 'string', enum: ['current', 'deprecated'], default: 'current' },
                        title: { type: 'string' },
                        type: {
                          type: 'string',
                          enum: ['api_config', 'basic', 'endpoint', 'link', 'webhook'],
                          default: 'basic',
                        },
                        updated_at: {
                          type: 'string',
                          format: 'date-time',
                          description: 'An ISO 8601 formatted date for when the page was updated.',
                        },
                        uri: {
                          type: 'string',
                          pattern:
                            '\\/versions\\/(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)\\/(guides|reference)\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                          description: 'A URI to the page resource.',
                        },
                        api_config: {
                          type: 'string',
                          enum: ['authentication', 'getting-started', 'my-requests'],
                          nullable: true,
                        },
                        api: {
                          type: 'object',
                          properties: {
                            method: {
                              type: 'string',
                              enum: ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'],
                              description: 'The endpoint HTTP method.',
                            },
                            path: { type: 'string', description: 'The endpoint path.' },
                            schema: {
                              nullable: true,
                              description:
                                'The API schema for this reference endpoint. This schema may be a reduced (i.e., only contains the necessary information for this endpoint) and/or dereferenced version of the full API definition, depending upon the query parameters used for this request.',
                            },
                            stats: {
                              type: 'object',
                              properties: {
                                additional_properties: {
                                  type: 'boolean',
                                  default: false,
                                  description:
                                    'This API operation uses `additionalProperties` for handling extra schema properties.',
                                },
                                callbacks: {
                                  type: 'boolean',
                                  default: false,
                                  description: 'This API operation has `callbacks` documented.',
                                },
                                circular_references: {
                                  type: 'boolean',
                                  default: false,
                                  description:
                                    'This API operation contains `$ref` schema pointers that resolve to itself.',
                                },
                                common_parameters: {
                                  type: 'boolean',
                                  default: false,
                                  description: 'This API operation utilizes common parameters set at the path level.',
                                },
                                discriminators: {
                                  type: 'boolean',
                                  default: false,
                                  description:
                                    'This API operation utilizes `discriminator` for discriminating between different parts in a polymorphic schema.',
                                },
                                links: {
                                  type: 'boolean',
                                  default: false,
                                  description: 'This API operation has `links` documented.',
                                },
                                polymorphism: {
                                  type: 'boolean',
                                  default: false,
                                  description: 'This API operation contains polymorphic schemas.',
                                },
                                server_variables: {
                                  type: 'boolean',
                                  default: false,
                                  description:
                                    'This API operation has composable variables configured for its server definition.',
                                },
                                style: {
                                  type: 'boolean',
                                  default: false,
                                  description:
                                    'This API operation has parameters that have specific `style` serializations.',
                                },
                                webhooks: {
                                  type: 'boolean',
                                  default: false,
                                  description: 'This API definition has `webhooks` documented.',
                                },
                                xml: {
                                  type: 'boolean',
                                  default: false,
                                  description: 'This API operation has parameters or schemas that serialize to XML.',
                                },
                                references: {
                                  type: 'boolean',
                                  description:
                                    'This API operation, after being dereferenced, has `x-readme-ref-name` entries defining what the original `$ref` schema pointers were named.',
                                },
                              },
                              required: ['references'],
                              additionalProperties: false,
                              description: 'OpenAPI features that are utilized within this API operation.',
                            },
                            source: {
                              type: 'string',
                              enum: [
                                'api',
                                'apidesigner',
                                'apieditor',
                                'bidi',
                                'form',
                                'postman',
                                'rdme',
                                'rdme_github',
                                'url',
                              ],
                              nullable: true,
                              description: 'The source by which this API definition was ingested.',
                            },
                            uri: {
                              type: 'string',
                              pattern:
                                '\\/versions\\/(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)\\/apis\\/((([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+.(json|yaml|yml)))',
                              nullable: true,
                              description: 'A URI to the API resource.',
                            },
                          },
                          required: ['method', 'path', 'stats', 'source', 'uri'],
                          additionalProperties: false,
                          description: 'Information about the API that this reference page is attached to.',
                        },
                        connections: {
                          type: 'object',
                          properties: {
                            recipes: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  uri: {
                                    type: 'string',
                                    pattern:
                                      '\\/versions\\/(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)\\/recipes\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                                    description:
                                      'URI of the recipe that this API reference is connected to. The recipe and API reference must exist within the same version.',
                                  },
                                },
                                required: ['uri'],
                                additionalProperties: false,
                              },
                              nullable: true,
                              description: 'A collection of recipes that are displayed on this API reference.',
                            },
                          },
                          required: ['recipes'],
                          additionalProperties: false,
                        },
                      },
                      required: [
                        'category',
                        'content',
                        'href',
                        'metadata',
                        'parent',
                        'privacy',
                        'project',
                        'renderable',
                        'slug',
                        'title',
                        'updated_at',
                        'uri',
                        'api_config',
                        'api',
                        'connections',
                      ],
                      additionalProperties: false,
                    },
                  },
                  required: ['data'],
                  additionalProperties: false,
                },
              },
            },
          },
        },
      },
      delete: {
        operationId: 'deleteReference',
        summary: 'Delete a reference page',
        tags: ['API Reference'],
        description:
          "Delete a page from the API Reference section of your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).\n\n>🚧 ReadMe's API v2 is currently in beta.\n >This API and its documentation are a work in progress. While we don't expect any major breaking changes, you may encounter occasional issues as we work toward a stable release. Make sure to [check out our API migration guide](https://docs.readme.com/main/reference/api-migration-guide), and [feel free to reach out](mailto:support@readme.io) if you have any questions or feedback!",
        parameters: [
          {
            schema: { type: 'string', pattern: 'stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?' },
            in: 'path',
            name: 'version',
            required: true,
            description: 'Project version number or `stable` for your stable project version.',
          },
          {
            schema: { type: 'string', pattern: '([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+' },
            in: 'path',
            name: 'slug',
            required: true,
            description: 'A URL-safe representation of the resource.',
          },
        ],
        responses: { '204': { description: 'No Content' } },
      },
      patch: {
        operationId: 'updateReference',
        summary: 'Update a reference page',
        tags: ['API Reference'],
        description:
          "Updates an existing page in the API Reference section of your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).\n\n>🚧 ReadMe's API v2 is currently in beta.\n >This API and its documentation are a work in progress. While we don't expect any major breaking changes, you may encounter occasional issues as we work toward a stable release. Make sure to [check out our API migration guide](https://docs.readme.com/main/reference/api-migration-guide), and [feel free to reach out](mailto:support@readme.io) if you have any questions or feedback!",
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  allow_crawlers: {
                    type: 'string',
                    enum: ['enabled', 'disabled'],
                    default: 'enabled',
                    description: 'Allow indexing by robots.',
                  },
                  category: {
                    type: 'object',
                    properties: {
                      uri: {
                        type: 'string',
                        pattern:
                          '\\/versions\\/(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)\\/categories\\/(guides|reference)\\/((.*))',
                        description: 'A URI to the category resource.',
                      },
                    },
                    additionalProperties: false,
                  },
                  content: {
                    type: 'object',
                    properties: {
                      body: { type: 'string', nullable: true },
                      excerpt: { type: 'string', nullable: true },
                      link: {
                        type: 'object',
                        properties: {
                          url: { type: 'string', nullable: true },
                          new_tab: { type: 'boolean', nullable: true },
                        },
                        additionalProperties: false,
                        description:
                          'Information about where this page should redirect to; only available when `type` is `link`.',
                      },
                      next: {
                        type: 'object',
                        properties: {
                          description: { type: 'string', nullable: true },
                          pages: {
                            type: 'array',
                            items: {
                              anyOf: [
                                {
                                  type: 'object',
                                  properties: {
                                    slug: { type: 'string' },
                                    title: { type: 'string', nullable: true },
                                    type: { type: 'string', enum: ['basic', 'endpoint'] },
                                  },
                                  required: ['slug', 'title', 'type'],
                                  additionalProperties: false,
                                },
                                {
                                  type: 'object',
                                  properties: {
                                    title: { type: 'string', nullable: true },
                                    type: { type: 'string', enum: ['link'] },
                                    url: { type: 'string' },
                                  },
                                  required: ['title', 'type', 'url'],
                                  additionalProperties: false,
                                },
                              ],
                            },
                          },
                        },
                        additionalProperties: false,
                      },
                    },
                    additionalProperties: false,
                  },
                  href: {
                    type: 'object',
                    properties: {
                      dash: { type: 'string', format: 'uri', description: 'A URL to this page in your ReadMe Dash.' },
                      hub: { type: 'string', format: 'uri', description: 'A URL to this page on your ReadMe hub.' },
                    },
                    additionalProperties: false,
                  },
                  metadata: {
                    type: 'object',
                    properties: {
                      description: { type: 'string', nullable: true },
                      keywords: { type: 'string', nullable: true },
                      title: { type: 'string', nullable: true },
                      image: {
                        type: 'object',
                        properties: { uri: { type: 'string', pattern: '\\/images\\/([a-f\\d]{24})', nullable: true } },
                        additionalProperties: false,
                      },
                    },
                    additionalProperties: false,
                  },
                  parent: {
                    type: 'object',
                    properties: {
                      uri: {
                        type: 'string',
                        pattern:
                          '\\/versions\\/(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)\\/(guides|reference)\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                        nullable: true,
                      },
                    },
                    additionalProperties: false,
                  },
                  privacy: {
                    type: 'object',
                    properties: {
                      view: { type: 'string', enum: ['public', 'anyone_with_link'], default: 'anyone_with_link' },
                    },
                    additionalProperties: false,
                  },
                  renderable: {
                    type: 'object',
                    properties: {
                      status: {
                        type: 'boolean',
                        default: true,
                        description: 'A flag for if the page is renderable or not.',
                      },
                      error: { type: 'string', nullable: true },
                      message: { type: 'string', nullable: true },
                    },
                    additionalProperties: false,
                  },
                  slug: {
                    allOf: [{ type: 'string' }, { type: 'string', minLength: 1 }],
                    description: 'The accessible URL slug for the page.',
                  },
                  state: { type: 'string', enum: ['current', 'deprecated'], default: 'current' },
                  title: { type: 'string' },
                  type: {
                    type: 'string',
                    enum: ['api_config', 'basic', 'endpoint', 'link', 'webhook'],
                    default: 'basic',
                  },
                  connections: {
                    type: 'object',
                    properties: {
                      recipes: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            uri: {
                              type: 'string',
                              pattern:
                                '\\/versions\\/(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)\\/recipes\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                              description:
                                'URI of the recipe that this API reference is connected to. The recipe and API reference must exist within the same version.',
                            },
                          },
                          additionalProperties: false,
                        },
                        nullable: true,
                      },
                    },
                    additionalProperties: false,
                  },
                  api: {
                    type: 'object',
                    properties: {
                      method: {
                        type: 'string',
                        enum: ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'],
                        description: 'The endpoint HTTP method.',
                      },
                      path: { type: 'string', description: 'The endpoint path.' },
                      schema: { nullable: true },
                      stats: {
                        type: 'object',
                        properties: {
                          additional_properties: {
                            type: 'boolean',
                            default: false,
                            description:
                              'This API operation uses `additionalProperties` for handling extra schema properties.',
                          },
                          callbacks: {
                            type: 'boolean',
                            default: false,
                            description: 'This API operation has `callbacks` documented.',
                          },
                          circular_references: {
                            type: 'boolean',
                            default: false,
                            description: 'This API operation contains `$ref` schema pointers that resolve to itself.',
                          },
                          common_parameters: {
                            type: 'boolean',
                            default: false,
                            description: 'This API operation utilizes common parameters set at the path level.',
                          },
                          discriminators: {
                            type: 'boolean',
                            default: false,
                            description:
                              'This API operation utilizes `discriminator` for discriminating between different parts in a polymorphic schema.',
                          },
                          links: {
                            type: 'boolean',
                            default: false,
                            description: 'This API operation has `links` documented.',
                          },
                          polymorphism: {
                            type: 'boolean',
                            default: false,
                            description: 'This API operation contains polymorphic schemas.',
                          },
                          server_variables: {
                            type: 'boolean',
                            default: false,
                            description:
                              'This API operation has composable variables configured for its server definition.',
                          },
                          style: {
                            type: 'boolean',
                            default: false,
                            description: 'This API operation has parameters that have specific `style` serializations.',
                          },
                          webhooks: {
                            type: 'boolean',
                            default: false,
                            description: 'This API definition has `webhooks` documented.',
                          },
                          xml: {
                            type: 'boolean',
                            default: false,
                            description: 'This API operation has parameters or schemas that serialize to XML.',
                          },
                          references: {
                            type: 'boolean',
                            description:
                              'This API operation, after being dereferenced, has `x-readme-ref-name` entries defining what the original `$ref` schema pointers were named.',
                          },
                        },
                        additionalProperties: false,
                        description: 'OpenAPI features that are utilized within this API operation.',
                      },
                      source: {
                        type: 'string',
                        enum: [
                          'api',
                          'apidesigner',
                          'apieditor',
                          'bidi',
                          'form',
                          'postman',
                          'rdme',
                          'rdme_github',
                          'url',
                        ],
                        nullable: true,
                      },
                      uri: {
                        type: 'string',
                        pattern:
                          '\\/versions\\/(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)\\/apis\\/((([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+.(json|yaml|yml)))',
                        nullable: true,
                      },
                    },
                    additionalProperties: false,
                    description:
                      'Information about the API that this reference page is attached to. If you wish to detach this page from an API definition, making it a stand page, set `api.uri` to `null`.',
                  },
                  position: { type: 'number' },
                },
                additionalProperties: false,
              },
            },
          },
        },
        parameters: [
          {
            schema: { type: 'string', pattern: 'stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?' },
            in: 'path',
            name: 'version',
            required: true,
            description: 'Project version number or `stable` for your stable project version.',
          },
          {
            schema: { type: 'string', pattern: '([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+' },
            in: 'path',
            name: 'slug',
            required: true,
            description: 'A URL-safe representation of the resource.',
          },
        ],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        allow_crawlers: {
                          type: 'string',
                          enum: ['enabled', 'disabled'],
                          default: 'enabled',
                          description: 'Allow indexing by robots.',
                        },
                        category: {
                          type: 'object',
                          properties: {
                            uri: {
                              type: 'string',
                              pattern:
                                '\\/versions\\/(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)\\/categories\\/(guides|reference)\\/((.*))',
                              description: 'A URI to the category resource.',
                            },
                          },
                          required: ['uri'],
                          additionalProperties: false,
                        },
                        content: {
                          type: 'object',
                          properties: {
                            body: { type: 'string', nullable: true },
                            excerpt: { type: 'string', nullable: true },
                            link: {
                              type: 'object',
                              properties: {
                                url: { type: 'string', nullable: true },
                                new_tab: {
                                  type: 'boolean',
                                  nullable: true,
                                  description: 'Should this URL be opened up in a new tab?',
                                },
                              },
                              required: ['url', 'new_tab'],
                              additionalProperties: false,
                              description:
                                'Information about where this page should redirect to; only available when `type` is `link`.',
                            },
                            next: {
                              type: 'object',
                              properties: {
                                description: { type: 'string', nullable: true },
                                pages: {
                                  type: 'array',
                                  items: {
                                    anyOf: [
                                      {
                                        type: 'object',
                                        properties: {
                                          slug: { type: 'string' },
                                          title: { type: 'string', nullable: true },
                                          type: { type: 'string', enum: ['basic', 'endpoint'] },
                                        },
                                        required: ['slug', 'title', 'type'],
                                        additionalProperties: false,
                                      },
                                      {
                                        type: 'object',
                                        properties: {
                                          title: { type: 'string', nullable: true },
                                          type: { type: 'string', enum: ['link'] },
                                          url: { type: 'string' },
                                        },
                                        required: ['title', 'type', 'url'],
                                        additionalProperties: false,
                                      },
                                    ],
                                  },
                                },
                              },
                              required: ['description', 'pages'],
                              additionalProperties: false,
                            },
                          },
                          required: ['body', 'excerpt', 'link', 'next'],
                          additionalProperties: false,
                        },
                        href: {
                          type: 'object',
                          properties: {
                            dash: {
                              type: 'string',
                              format: 'uri',
                              description: 'A URL to this page in your ReadMe Dash.',
                            },
                            hub: {
                              type: 'string',
                              format: 'uri',
                              description: 'A URL to this page on your ReadMe hub.',
                            },
                          },
                          required: ['dash', 'hub'],
                          additionalProperties: false,
                        },
                        metadata: {
                          type: 'object',
                          properties: {
                            description: { type: 'string', nullable: true },
                            image: {
                              type: 'object',
                              properties: {
                                uri: {
                                  type: 'string',
                                  pattern: '\\/images\\/([a-f\\d]{24})',
                                  nullable: true,
                                  description:
                                    'A URI to the `getImages` endpoint for this image. If the is a legacy image then this `uri` will be `null`. And if you wish to delete this image then you should set this to `null`.',
                                },
                                url: { type: 'string', format: 'uri', nullable: true },
                              },
                              required: ['uri', 'url'],
                              additionalProperties: false,
                            },
                            keywords: {
                              type: 'string',
                              nullable: true,
                              description: 'A comma-separated list of keywords to place into your page metadata.',
                            },
                            title: { type: 'string', nullable: true },
                          },
                          required: ['description', 'image', 'keywords', 'title'],
                          additionalProperties: false,
                        },
                        parent: {
                          type: 'object',
                          properties: {
                            uri: {
                              type: 'string',
                              pattern:
                                '\\/versions\\/(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)\\/(guides|reference)\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                              nullable: true,
                              description: 'A URI to the parent page resource including the page ID or slug.',
                            },
                          },
                          required: ['uri'],
                          additionalProperties: false,
                        },
                        privacy: {
                          type: 'object',
                          properties: {
                            view: { type: 'string', enum: ['public', 'anyone_with_link'], default: 'anyone_with_link' },
                          },
                          additionalProperties: false,
                        },
                        project: {
                          type: 'object',
                          properties: {
                            name: { type: 'string', description: 'The name of the project.' },
                            subdomain: {
                              type: 'string',
                              pattern: '[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*',
                              maxLength: 30,
                              description: 'The subdomain of the project.',
                            },
                            uri: {
                              type: 'string',
                              pattern: '\\/projects\\/(me|[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*)',
                              description: 'A URI to the project that this page belongs to.',
                            },
                          },
                          required: ['name', 'subdomain', 'uri'],
                          additionalProperties: false,
                        },
                        renderable: {
                          type: 'object',
                          properties: {
                            status: {
                              type: 'boolean',
                              default: true,
                              description: 'A flag for if the page is renderable or not.',
                            },
                            error: { type: 'string', nullable: true, description: 'The rendering error.' },
                            message: {
                              type: 'string',
                              nullable: true,
                              description: 'Additional details about the rendering error.',
                            },
                          },
                          additionalProperties: false,
                        },
                        slug: {
                          allOf: [{ type: 'string' }, { type: 'string', minLength: 1 }],
                          description: 'The accessible URL slug for the page.',
                        },
                        state: { type: 'string', enum: ['current', 'deprecated'], default: 'current' },
                        title: { type: 'string' },
                        type: {
                          type: 'string',
                          enum: ['api_config', 'basic', 'endpoint', 'link', 'webhook'],
                          default: 'basic',
                        },
                        updated_at: {
                          type: 'string',
                          format: 'date-time',
                          description: 'An ISO 8601 formatted date for when the page was updated.',
                        },
                        uri: {
                          type: 'string',
                          pattern:
                            '\\/versions\\/(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)\\/(guides|reference)\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                          description: 'A URI to the page resource.',
                        },
                        api_config: {
                          type: 'string',
                          enum: ['authentication', 'getting-started', 'my-requests'],
                          nullable: true,
                        },
                        api: {
                          type: 'object',
                          properties: {
                            method: {
                              type: 'string',
                              enum: ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'],
                              description: 'The endpoint HTTP method.',
                            },
                            path: { type: 'string', description: 'The endpoint path.' },
                            schema: {
                              nullable: true,
                              description:
                                'The API schema for this reference endpoint. This schema may be a reduced (i.e., only contains the necessary information for this endpoint) and/or dereferenced version of the full API definition, depending upon the query parameters used for this request.',
                            },
                            stats: {
                              type: 'object',
                              properties: {
                                additional_properties: {
                                  type: 'boolean',
                                  default: false,
                                  description:
                                    'This API operation uses `additionalProperties` for handling extra schema properties.',
                                },
                                callbacks: {
                                  type: 'boolean',
                                  default: false,
                                  description: 'This API operation has `callbacks` documented.',
                                },
                                circular_references: {
                                  type: 'boolean',
                                  default: false,
                                  description:
                                    'This API operation contains `$ref` schema pointers that resolve to itself.',
                                },
                                common_parameters: {
                                  type: 'boolean',
                                  default: false,
                                  description: 'This API operation utilizes common parameters set at the path level.',
                                },
                                discriminators: {
                                  type: 'boolean',
                                  default: false,
                                  description:
                                    'This API operation utilizes `discriminator` for discriminating between different parts in a polymorphic schema.',
                                },
                                links: {
                                  type: 'boolean',
                                  default: false,
                                  description: 'This API operation has `links` documented.',
                                },
                                polymorphism: {
                                  type: 'boolean',
                                  default: false,
                                  description: 'This API operation contains polymorphic schemas.',
                                },
                                server_variables: {
                                  type: 'boolean',
                                  default: false,
                                  description:
                                    'This API operation has composable variables configured for its server definition.',
                                },
                                style: {
                                  type: 'boolean',
                                  default: false,
                                  description:
                                    'This API operation has parameters that have specific `style` serializations.',
                                },
                                webhooks: {
                                  type: 'boolean',
                                  default: false,
                                  description: 'This API definition has `webhooks` documented.',
                                },
                                xml: {
                                  type: 'boolean',
                                  default: false,
                                  description: 'This API operation has parameters or schemas that serialize to XML.',
                                },
                                references: {
                                  type: 'boolean',
                                  description:
                                    'This API operation, after being dereferenced, has `x-readme-ref-name` entries defining what the original `$ref` schema pointers were named.',
                                },
                              },
                              required: ['references'],
                              additionalProperties: false,
                              description: 'OpenAPI features that are utilized within this API operation.',
                            },
                            source: {
                              type: 'string',
                              enum: [
                                'api',
                                'apidesigner',
                                'apieditor',
                                'bidi',
                                'form',
                                'postman',
                                'rdme',
                                'rdme_github',
                                'url',
                              ],
                              nullable: true,
                              description: 'The source by which this API definition was ingested.',
                            },
                            uri: {
                              type: 'string',
                              pattern:
                                '\\/versions\\/(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)\\/apis\\/((([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+.(json|yaml|yml)))',
                              nullable: true,
                              description: 'A URI to the API resource.',
                            },
                          },
                          required: ['method', 'path', 'stats', 'source', 'uri'],
                          additionalProperties: false,
                          description: 'Information about the API that this reference page is attached to.',
                        },
                        connections: {
                          type: 'object',
                          properties: {
                            recipes: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  uri: {
                                    type: 'string',
                                    pattern:
                                      '\\/versions\\/(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)\\/recipes\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                                    description:
                                      'URI of the recipe that this API reference is connected to. The recipe and API reference must exist within the same version.',
                                  },
                                },
                                required: ['uri'],
                                additionalProperties: false,
                              },
                              nullable: true,
                              description: 'A collection of recipes that are displayed on this API reference.',
                            },
                          },
                          required: ['recipes'],
                          additionalProperties: false,
                        },
                      },
                      required: [
                        'category',
                        'content',
                        'href',
                        'metadata',
                        'parent',
                        'privacy',
                        'project',
                        'renderable',
                        'slug',
                        'title',
                        'updated_at',
                        'uri',
                        'api_config',
                        'api',
                        'connections',
                      ],
                      additionalProperties: false,
                    },
                  },
                  required: ['data'],
                  additionalProperties: false,
                },
              },
            },
          },
        },
      },
    },
    '/search': {
      get: {
        operationId: 'search',
        summary: 'Perform a search query',
        tags: ['Search'],
        description:
          "Searches the ReadMe project.\n\n>🚧 ReadMe's API v2 is currently in beta.\n >This API and its documentation are a work in progress. While we don't expect any major breaking changes, you may encounter occasional issues as we work toward a stable release. Make sure to [check out our API migration guide](https://docs.readme.com/main/reference/api-migration-guide), and [feel free to reach out](mailto:support@readme.io) if you have any questions or feedback!",
        parameters: [
          {
            schema: { type: 'string' },
            in: 'query',
            name: 'query',
            required: true,
            description: 'The plain text search query used to search across the project.',
          },
          {
            schema: {
              type: 'string',
              enum: ['guides', 'reference', 'recipes', 'custom_pages', 'discuss', 'changelog'],
            },
            in: 'query',
            name: 'section',
            required: false,
            description: 'The section to search within.',
          },
          {
            schema: { type: 'string' },
            in: 'query',
            name: 'version',
            required: false,
            description: 'The version to search within. For enterprise, this only applies to the current project.',
          },
          {
            schema: { type: 'array', items: { type: 'string' } },
            in: 'query',
            name: 'projects',
            required: false,
            description: 'Limit search to only these projects in an Enterprise group.',
          },
        ],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    total: { type: 'number' },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          url: {
                            type: 'object',
                            properties: {
                              full: { type: 'string', description: 'The full URL of the page.' },
                              relative: {
                                type: 'string',
                                description: 'The relative URL of the page without the version or base URL.',
                              },
                            },
                            required: ['full', 'relative'],
                            additionalProperties: false,
                          },
                          title: { type: 'string' },
                          excerpt: { type: 'string' },
                          highlights: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                score: { type: 'number' },
                                path: { type: 'string', enum: ['title', 'excerpt', 'searchContents'] },
                                texts: {
                                  type: 'array',
                                  items: {
                                    type: 'object',
                                    properties: {
                                      value: { type: 'string' },
                                      type: { type: 'string', enum: ['hit', 'text'] },
                                    },
                                    required: ['value', 'type'],
                                    additionalProperties: false,
                                  },
                                },
                              },
                              required: ['score', 'path', 'texts'],
                              additionalProperties: false,
                            },
                          },
                          slug: { type: 'string' },
                          section: {
                            type: 'string',
                            enum: ['guides', 'reference', 'recipes', 'custom_pages', 'discuss', 'changelog'],
                          },
                          version: {
                            type: 'string',
                            nullable: true,
                            description: 'The semver version number this search is scoped to.',
                          },
                          project: {
                            type: 'object',
                            properties: { subdomain: { type: 'string' }, name: { type: 'string' } },
                            required: ['subdomain', 'name'],
                            additionalProperties: false,
                          },
                          api: {
                            type: 'object',
                            properties: { method: { type: 'string', nullable: true } },
                            required: ['method'],
                            additionalProperties: false,
                          },
                          uri: { type: 'string' },
                        },
                        required: [
                          'url',
                          'title',
                          'excerpt',
                          'highlights',
                          'slug',
                          'section',
                          'version',
                          'project',
                          'api',
                          'uri',
                        ],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ['total', 'data'],
                  additionalProperties: false,
                },
              },
            },
          },
        },
      },
    },
    '/versions': {
      get: {
        operationId: 'getVersions',
        summary: 'Get versions',
        tags: ['Versions'],
        description:
          "Get a collection of versions.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).\n\n>🚧 ReadMe's API v2 is currently in beta.\n >This API and its documentation are a work in progress. While we don't expect any major breaking changes, you may encounter occasional issues as we work toward a stable release. Make sure to [check out our API migration guide](https://docs.readme.com/main/reference/api-migration-guide), and [feel free to reach out](mailto:support@readme.io) if you have any questions or feedback!",
        parameters: [
          {
            schema: { type: 'number', minimum: 1, default: 1 },
            in: 'query',
            name: 'page',
            required: false,
            description: 'Used to specify further pages (starts at 1).',
          },
          {
            schema: { type: 'number', minimum: 1, maximum: 100, default: 10 },
            in: 'query',
            name: 'per_page',
            required: false,
            description: 'Number of items to include in pagination (up to 100, defaults to 10).',
          },
          {
            schema: { type: 'string', enum: ['created', 'updated', 'semver'], default: 'semver' },
            in: 'query',
            name: 'sort_by',
            required: false,
            description: 'The sort that should be used for the returned versions list.',
          },
        ],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    total: { type: 'number' },
                    page: { type: 'number' },
                    per_page: { type: 'number' },
                    paging: {
                      type: 'object',
                      properties: {
                        next: { type: 'string', nullable: true },
                        previous: { type: 'string', nullable: true },
                        first: { type: 'string', nullable: true },
                        last: { type: 'string', nullable: true },
                      },
                      required: ['next', 'previous', 'first', 'last'],
                      additionalProperties: false,
                    },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          base: {
                            type: 'string',
                            nullable: true,
                            description: 'The name of the version this version was forked from.',
                          },
                          display_name: {
                            type: 'string',
                            nullable: true,
                            description: 'A non-semver display name for the version.',
                          },
                          name: {
                            type: 'string',
                            pattern: 'stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?',
                            description: 'The semver name for the version.',
                          },
                          privacy: {
                            type: 'object',
                            properties: {
                              view: {
                                type: 'string',
                                enum: ['default', 'hidden', 'public'],
                                description:
                                  "Whether the version is public, hidden, or the stable version that's visible by default.",
                              },
                            },
                            required: ['view'],
                            additionalProperties: false,
                          },
                          release_stage: {
                            type: 'string',
                            enum: ['beta', 'release'],
                            description: 'Whether the version is released or in beta',
                          },
                          source: {
                            type: 'string',
                            enum: ['readme', 'bidi'],
                            description: 'Whether the version was created in ReadMe or via BiDirectional Sync.',
                          },
                          state: {
                            type: 'string',
                            enum: ['current', 'deprecated'],
                            description: 'Whether the version is current or deprecated',
                          },
                          updated_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'An ISO 8601 formatted date for when the version was last updated.',
                          },
                          uri: {
                            type: 'string',
                            pattern: '\\/versions\\/(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)',
                            description: 'A URI to the version resource.',
                          },
                        },
                        required: [
                          'base',
                          'display_name',
                          'name',
                          'privacy',
                          'release_stage',
                          'source',
                          'state',
                          'updated_at',
                          'uri',
                        ],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ['total', 'page', 'per_page', 'paging', 'data'],
                  additionalProperties: false,
                },
              },
            },
          },
        },
      },
    },
  },
  servers: [{ url: 'https://api.readme.com/v2', description: 'The ReadMe API' }],
  security: [{ bearer: [] }],
  'x-readme': { 'proxy-enabled': true },
  tags: [
    { name: 'API Keys' },
    { name: 'API Reference' },
    { name: 'APIs' },
    { name: 'Categories' },
    { name: 'Changelog' },
    { name: 'Custom Pages' },
    { name: 'Guides' },
    { name: 'Projects' },
    { name: 'Search' },
    { name: 'Versions' },
  ],
} as const satisfies OASDocument;

export default document;
