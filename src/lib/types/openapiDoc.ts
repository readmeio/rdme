import type { OASDocument } from 'oas/types';

/**
 * This is a snapshot of the OpenAPI description for ReadMe APIv2.
 *
 * This is used both for typechecking as well as for runtime validation.
 * We use ajv to validate the user data against schemas in this document.
 *
 * @see {@link https://docs.readme.com/main/openapi/readme-api-v2-beta.json}
 */
const document = {
  openapi: '3.1.0',
  info: {
    description: 'Create beautiful product and API documentation with our developer friendly platform.',
    version: '2.0.0',
    title: 'ReadMe API',
    'x-readme-deploy': '5.732.0',
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
        description: 'Create an API key for your ReadMe project.',
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
        description: 'Get the API keys for your ReadMe project.',
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
        description: 'Delete an API key from your ReadMe project.',
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
        description: 'Get an API key for your ReadMe project.',
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
        description: 'Update an API key on your ReadMe project.',
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
    '/branches/{branch}/apis': {
      get: {
        operationId: 'getAPIs',
        summary: 'Get all API definitions',
        tags: ['APIs'],
        description:
          'Get all API definitions from your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).',
        parameters: [
          {
            schema: {
              type: 'string',
              pattern: '(v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?',
            },
            in: 'path',
            name: 'branch',
            required: true,
            description: "Project version number, `stable` for your project's stable version, or a valid branch name.",
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
                          legacy_id: {
                            type: 'string',
                            pattern: '[a-f\\d]{24}',
                            nullable: true,
                            description:
                              'The legacy ID of your API definition. This is only used for legacy rdme CLI workflows and only applies if your project, and this API definition, predates ReadMe Refactored. We consider this value to be deprecated and recommend against relying on it going forward.',
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
                              sync_url: {
                                type: 'string',
                                nullable: true,
                                description: 'The source URL for API definitions ingested via URL.',
                              },
                            },
                            required: ['current', 'original', 'sync_url'],
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
                              '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/apis\\/((([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+.(json|yaml|yml)))',
                            description: 'A URI to the API definition resource.',
                          },
                        },
                        required: [
                          'created_at',
                          'filename',
                          'legacy_id',
                          'source',
                          'type',
                          'updated_at',
                          'upload',
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
      post: {
        operationId: 'createAPI',
        summary: 'Create an API definition',
        tags: ['APIs'],
        description:
          'Create an API definition in the API Reference section of your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).',
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
                description:
                  'The API definition to upload. We provide full support for OpenAPI 3.x and Swagger 2.0 and experimental support for Postman collections.',
              },
            },
          },
          description:
            'The API definition to upload. We provide full support for OpenAPI 3.x and Swagger 2.0 and experimental support for Postman collections.',
        },
        parameters: [
          {
            schema: {
              type: 'string',
              pattern: '(v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?',
            },
            in: 'path',
            name: 'branch',
            required: true,
            description: "Project version number, `stable` for your project's stable version, or a valid branch name.",
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
                            '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/apis\\/((([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+.(json|yaml|yml)))',
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
    '/branches/{branch}/apis/{filename}': {
      get: {
        operationId: 'getAPI',
        summary: 'Get an API definition',
        tags: ['APIs'],
        description:
          'Get an API definition from your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).',
        parameters: [
          {
            schema: { type: 'string', pattern: '(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+.(json|yaml|yml))' },
            in: 'path',
            name: 'filename',
            required: true,
            description: 'The filename of the API definition to retrieve.',
          },
          {
            schema: {
              type: 'string',
              pattern: '(v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?',
            },
            in: 'path',
            name: 'branch',
            required: true,
            description: "Project version number, `stable` for your project's stable version, or a valid branch name.",
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
                        legacy_id: {
                          type: 'string',
                          pattern: '[a-f\\d]{24}',
                          nullable: true,
                          description:
                            'The legacy ID of your API definition. This is only used for legacy rdme CLI workflows and only applies if your project, and this API definition, predates ReadMe Refactored. We consider this value to be deprecated and recommend against relying on it going forward.',
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
                            sync_url: {
                              type: 'string',
                              nullable: true,
                              description: 'The source URL for API definitions ingested via URL.',
                            },
                          },
                          required: ['current', 'original', 'sync_url'],
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
                            '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/apis\\/((([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+.(json|yaml|yml)))',
                          description: 'A URI to the API definition resource.',
                        },
                        schema: { nullable: true, description: 'The API schema.' },
                      },
                      required: [
                        'created_at',
                        'filename',
                        'legacy_id',
                        'source',
                        'type',
                        'updated_at',
                        'upload',
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
        operationId: 'deleteAPI',
        summary: 'Delete an API definition',
        tags: ['APIs'],
        description:
          'Delete an API definition from the API Reference section of your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).',
        parameters: [
          {
            schema: { type: 'string', pattern: '(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+.(json|yaml|yml))' },
            in: 'path',
            name: 'filename',
            required: true,
            description: 'The filename of the API definition to retrieve.',
          },
          {
            schema: {
              type: 'string',
              pattern: '(v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?',
            },
            in: 'path',
            name: 'branch',
            required: true,
            description: "Project version number, `stable` for your project's stable version, or a valid branch name.",
          },
        ],
        responses: { '204': { description: 'No Content' } },
      },
      put: {
        operationId: 'updateAPI',
        summary: 'Update an API definition',
        tags: ['APIs'],
        description:
          'Updates an API definition in the API Reference section of your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).',
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
                description:
                  'The API definition to upload. We provide full support for OpenAPI 3.x and Swagger 2.0 and experimental support for Postman collections.',
              },
            },
          },
          description:
            'The API definition to upload. We provide full support for OpenAPI 3.x and Swagger 2.0 and experimental support for Postman collections.',
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
            schema: {
              type: 'string',
              pattern: '(v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?',
            },
            in: 'path',
            name: 'branch',
            required: true,
            description: "Project version number, `stable` for your project's stable version, or a valid branch name.",
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
                            '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/apis\\/((([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+.(json|yaml|yml)))',
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
    '/apply': {
      get: {
        operationId: 'getOpenRoles',
        summary: 'Get open roles',
        tags: ['Apply to ReadMe'],
        description: "Returns all the roles we're hiring for at ReadMe!",
        security: [],
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
                          slug: { type: 'string' },
                          title: { type: 'string' },
                          description: {
                            type: 'string',
                            description: 'The description for this open position. This content is formatted as HTML.',
                          },
                          pullquote: { type: 'string', description: 'A short pullquote for the open position.' },
                          location: { type: 'string', description: 'Where this position is located at.' },
                          department: {
                            type: 'string',
                            description: "The internal organization you'll be working in.",
                          },
                          url: {
                            type: 'string',
                            format: 'uri',
                            description: 'The place where you can apply for the position!',
                          },
                        },
                        required: ['slug', 'title', 'description', 'pullquote', 'location', 'department', 'url'],
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
        operationId: 'applyToReadMe',
        summary: 'Submit your application!',
        tags: ['Apply to ReadMe'],
        description:
          'This endpoint will let you apply to a job at ReadMe programatically, without having to go through our UI!',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', minLength: 1, description: 'Your full name' },
                  email: {
                    type: 'string',
                    format: 'email',
                    default: 'you@example.com',
                    description: 'A valid email we can reach you at.',
                  },
                  job: {
                    type: 'string',
                    description: "The job you're looking to apply for (https://readme.com/careers).",
                  },
                  pronouns: { type: 'string', description: 'Learn more at https://lgbtlifecenter.org/pronouns/' },
                  linkedin: {
                    type: 'string',
                    format: 'uri',
                    description: 'What have you been up to the past few years?',
                  },
                  github: {
                    type: 'string',
                    format: 'uri',
                    description: 'Or Bitbucket, GitLab or anywhere else your code is hosted!',
                  },
                  coverLetter: { type: 'string', description: 'What should we know about you?' },
                  dont_really_apply: {
                    type: 'boolean',
                    default: false,
                    description: 'If you set this to true, we will not actually apply you to the job.',
                  },
                },
                required: ['name', 'job'],
                additionalProperties: false,
              },
            },
          },
          required: true,
        },
        security: [],
        responses: {
          '201': {
            description: 'Created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    keyvalues: { type: 'string' },
                    careers: { type: 'string' },
                    'questions?': { type: 'string' },
                    poem: { type: 'array', items: { type: 'string' } },
                  },
                  required: ['message', 'keyvalues', 'careers', 'questions?', 'poem'],
                  additionalProperties: false,
                },
              },
            },
          },
        },
      },
    },
    '/branches/{branch}/categories': {
      post: {
        operationId: 'createCategory',
        summary: 'Create a category',
        tags: ['Categories'],
        description:
          'Create a category in your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).',
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
            schema: {
              type: 'string',
              pattern: '(v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?',
            },
            in: 'path',
            name: 'branch',
            required: true,
            description: "Project version number, `stable` for your project's stable version, or a valid branch name.",
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
                            '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/categories\\/(guides|reference)\\/((.*))',
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
    '/branches/{branch}/categories/{section}': {
      get: {
        operationId: 'getCategories',
        summary: 'Get all categories',
        tags: ['Categories'],
        description:
          'Get all categories within a section of your ReadMe project.\n\nThe sorting of this data is dependent upon the order of the categories in your sidebar.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).',
        parameters: [
          {
            schema: { type: 'string', enum: ['guides', 'reference'] },
            in: 'path',
            name: 'section',
            required: true,
            description: 'The section of your documentation to get categories from.',
          },
          {
            schema: {
              type: 'string',
              pattern: '(v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?',
            },
            in: 'path',
            name: 'branch',
            required: true,
            description: "Project version number, `stable` for your project's stable version, or a valid branch name.",
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
                              '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/categories\\/(guides|reference)\\/((.*))',
                            description: 'A URI to the category resource.',
                          },
                        },
                        required: ['title', 'links', 'uri'],
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
    '/branches/{branch}/categories/{section}/{title}': {
      get: {
        operationId: 'getCategory',
        summary: 'Get a category',
        tags: ['Categories'],
        description:
          'Get a category in your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).',
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
            schema: {
              type: 'string',
              pattern: '(v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?',
            },
            in: 'path',
            name: 'branch',
            required: true,
            description: "Project version number, `stable` for your project's stable version, or a valid branch name.",
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
                            '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/categories\\/(guides|reference)\\/((.*))',
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
      delete: {
        operationId: 'deleteCategory',
        summary: 'Delete a category',
        tags: ['Categories'],
        description:
          'Delete a category from your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).',
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
            schema: {
              type: 'string',
              pattern: '(v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?',
            },
            in: 'path',
            name: 'branch',
            required: true,
            description: "Project version number, `stable` for your project's stable version, or a valid branch name.",
          },
        ],
        responses: { '204': { description: 'No Content' } },
      },
      patch: {
        operationId: 'updateCategory',
        summary: 'Update a category',
        tags: ['Categories'],
        description:
          'Update an existing category in your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string', description: "The category's name." },
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
            schema: {
              type: 'string',
              pattern: '(v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?',
            },
            in: 'path',
            name: 'branch',
            required: true,
            description: "Project version number, `stable` for your project's stable version, or a valid branch name.",
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
                            '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/categories\\/(guides|reference)\\/((.*))',
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
    '/branches/{branch}/categories/{section}/{title}/pages': {
      get: {
        operationId: 'getCategoryPages',
        summary: 'Get the pages within a category',
        tags: ['Categories'],
        description:
          'Get a pages that exist within a category in your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).',
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
            schema: {
              type: 'string',
              pattern: '(v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?',
            },
            in: 'path',
            name: 'branch',
            required: true,
            description: "Project version number, `stable` for your project's stable version, or a valid branch name.",
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
                          category: {
                            type: 'object',
                            properties: {
                              uri: {
                                type: 'string',
                                pattern:
                                  '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/categories\\/(guides|reference)\\/((.*))',
                                description: 'A URI to the category resource.',
                              },
                            },
                            required: ['uri'],
                            additionalProperties: false,
                          },
                          parent: {
                            type: 'object',
                            properties: {
                              uri: {
                                type: 'string',
                                pattern:
                                  '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/(guides|reference)\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                                nullable: true,
                                description: 'A URI to the parent page resource including the page ID or slug.',
                              },
                            },
                            required: ['uri'],
                            additionalProperties: false,
                          },
                          slug: {
                            allOf: [{ type: 'string' }, { type: 'string', minLength: 1 }],
                            description: 'The accessible URL slug for the page.',
                          },
                          title: { type: 'string' },
                          updated_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'An ISO 8601 formatted date for when the page was updated.',
                          },
                          uri: {
                            type: 'string',
                            pattern:
                              '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/(guides|reference)\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                            description: 'A URI to the page resource.',
                          },
                        },
                        required: ['category', 'parent', 'slug', 'title', 'updated_at', 'uri'],
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
    '/changelogs': {
      post: {
        operationId: 'createChangelog',
        summary: 'Create a changelog entry',
        tags: ['Changelog'],
        description: 'Create a new changelog entry in your ReadMe project.',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  author: {
                    type: 'object',
                    properties: { id: { type: 'string', nullable: true } },
                    additionalProperties: false,
                  },
                  content: {
                    type: 'object',
                    properties: { body: { type: 'string', nullable: true } },
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
                        description: 'The visibility of this changelog.',
                      },
                    },
                    additionalProperties: false,
                  },
                  slug: { type: 'string' },
                  title: { type: 'string' },
                  i18n: {
                    type: 'object',
                    properties: {
                      lang: {
                        type: 'string',
                        enum: ['en', 'de', 'es', 'fr', 'it', 'ja', 'ko', 'nl', 'pt', 'zh'],
                        default: 'en',
                        description: 'The language of the changelog.',
                      },
                    },
                    additionalProperties: false,
                  },
                  type: {
                    type: 'string',
                    enum: ['none', 'added', 'fixed', 'improved', 'deprecated', 'removed'],
                    default: 'none',
                    description: 'The type of changelog that this is.',
                  },
                },
                required: ['title'],
                additionalProperties: false,
              },
            },
          },
          required: true,
        },
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
                          properties: {
                            body: { type: 'string', nullable: true },
                            html: { type: 'string', nullable: true },
                          },
                          required: ['body', 'html'],
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
                        i18n: {
                          type: 'object',
                          properties: {
                            lang: {
                              type: 'string',
                              enum: ['en', 'de', 'es', 'fr', 'it', 'ja', 'ko', 'nl', 'pt', 'zh'],
                              default: 'en',
                              description: 'The language of the changelog.',
                            },
                          },
                          additionalProperties: false,
                        },
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
                        'i18n',
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
        operationId: 'getChangelogs',
        summary: 'Get all changelog entries',
        tags: ['Changelog'],
        description: 'Get all changelog entries from your ReadMe project.',
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
                            properties: {
                              body: { type: 'string', nullable: true },
                              html: { type: 'string', nullable: true },
                            },
                            required: ['body', 'html'],
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
                          i18n: {
                            type: 'object',
                            properties: {
                              lang: {
                                type: 'string',
                                enum: ['en', 'de', 'es', 'fr', 'it', 'ja', 'ko', 'nl', 'pt', 'zh'],
                                default: 'en',
                                description: 'The language of the changelog.',
                              },
                            },
                            additionalProperties: false,
                          },
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
                          'i18n',
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
        description: 'Get a changelog entry from your ReadMe project.',
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
            description: 'The unique identifier for the resource.',
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
                          properties: {
                            body: { type: 'string', nullable: true },
                            html: { type: 'string', nullable: true },
                          },
                          required: ['body', 'html'],
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
                        i18n: {
                          type: 'object',
                          properties: {
                            lang: {
                              type: 'string',
                              enum: ['en', 'de', 'es', 'fr', 'it', 'ja', 'ko', 'nl', 'pt', 'zh'],
                              default: 'en',
                              description: 'The language of the changelog.',
                            },
                          },
                          additionalProperties: false,
                        },
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
                        'i18n',
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
        operationId: 'deleteChangelog',
        summary: 'Delete a changelog entry',
        tags: ['Changelog'],
        description: 'Delete a changelog entry from your ReadMe project.',
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
            description: 'The unique identifier for the resource.',
          },
        ],
        responses: { '204': { description: 'No Content' } },
      },
      patch: {
        operationId: 'updateChangelog',
        summary: 'Update a changelog entry',
        tags: ['Changelog'],
        description: 'Update an existing changelog entry in your ReadMe project.',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  author: {
                    type: 'object',
                    properties: { id: { type: 'string', nullable: true }, name: { type: 'string', nullable: true } },
                    additionalProperties: false,
                  },
                  content: {
                    type: 'object',
                    properties: { body: { type: 'string', nullable: true } },
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
                        description: 'The visibility of this changelog.',
                      },
                    },
                    additionalProperties: false,
                  },
                  slug: { type: 'string' },
                  title: { type: 'string' },
                  i18n: {
                    type: 'object',
                    properties: {
                      lang: {
                        type: 'string',
                        enum: ['en', 'de', 'es', 'fr', 'it', 'ja', 'ko', 'nl', 'pt', 'zh'],
                        default: 'en',
                        description: 'The language of the changelog.',
                      },
                    },
                    additionalProperties: false,
                  },
                  type: {
                    type: 'string',
                    enum: ['none', 'added', 'fixed', 'improved', 'deprecated', 'removed'],
                    default: 'none',
                    description: 'The type of changelog that this is.',
                  },
                },
                additionalProperties: false,
              },
            },
          },
        },
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
            description: 'The unique identifier for the resource.',
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
                          properties: {
                            body: { type: 'string', nullable: true },
                            html: { type: 'string', nullable: true },
                          },
                          required: ['body', 'html'],
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
                        i18n: {
                          type: 'object',
                          properties: {
                            lang: {
                              type: 'string',
                              enum: ['en', 'de', 'es', 'fr', 'it', 'ja', 'ko', 'nl', 'pt', 'zh'],
                              default: 'en',
                              description: 'The language of the changelog.',
                            },
                          },
                          additionalProperties: false,
                        },
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
                        'i18n',
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
    '/discuss/{identifier}': {
      get: {
        operationId: 'getDiscuss',
        summary: 'Get a discussion',
        tags: ['Discuss'],
        description: 'Get a discussion from your ReadMe project.',
        parameters: [
          {
            schema: { type: 'string', pattern: '[a-f\\d]{24}' },
            in: 'path',
            name: 'identifier',
            required: true,
            description: 'A unique identifier for the resource.',
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
                            id: {
                              type: 'string',
                              nullable: true,
                              description: 'User ID of the discussion author (if logged in).',
                            },
                            name: { type: 'string', description: 'Name of the user who created the discussion.' },
                            email: {
                              type: 'string',
                              nullable: true,
                              description: 'Email of the user who created the discussion.',
                            },
                          },
                          required: ['id', 'name', 'email'],
                          additionalProperties: false,
                        },
                        content: {
                          type: 'object',
                          properties: { body: { type: 'string', description: 'The body content of the discussion.' } },
                          required: ['body'],
                          additionalProperties: false,
                        },
                        is_faq: {
                          type: 'boolean',
                          default: false,
                          description: 'Whether this discussion is marked as a FAQ.',
                        },
                        solved: {
                          type: 'boolean',
                          default: false,
                          description: 'Whether this discussion has been solved.',
                        },
                        tags: {
                          type: 'array',
                          items: { type: 'string' },
                          default: [],
                          description: 'Tags associated with this discussion.',
                        },
                        title: { type: 'string', description: 'The title of the discussion.' },
                        views: {
                          type: 'number',
                          default: 0,
                          description: 'Number of times this discussion has been viewed.',
                        },
                        votes: {
                          type: 'number',
                          default: 0,
                          description: 'Number of votes this discussion has received.',
                        },
                        created_at: {
                          type: 'string',
                          format: 'date-time',
                          description: 'An ISO 8601 formatted date for when the discussion was created.',
                        },
                        id: { type: 'string', description: 'The unique identifier for this discussion.' },
                        links: {
                          type: 'object',
                          properties: {
                            project: {
                              type: 'string',
                              pattern: '\\/projects\\/(me|[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*)',
                              description: 'A URI to the project that this discussion belongs to.',
                            },
                          },
                          required: ['project'],
                          additionalProperties: false,
                        },
                        updated_at: {
                          type: 'string',
                          format: 'date-time',
                          description: 'An ISO 8601 formatted date for when the discussion was updated.',
                        },
                        uri: {
                          type: 'string',
                          pattern: '\\/discuss\\/([a-f\\d]{24})',
                          description: 'The unique identifier for this discussion.',
                        },
                      },
                      required: ['author', 'content', 'title', 'created_at', 'id', 'links', 'updated_at', 'uri'],
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
    '/branches/{branch}/custom_pages': {
      post: {
        operationId: 'createCustomPage',
        summary: 'Create a custom page',
        tags: ['Custom Pages'],
        description:
          'Create a custom page in your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).',
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
                        default: 'public',
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
            schema: {
              type: 'string',
              pattern: '(v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?',
            },
            in: 'path',
            name: 'branch',
            required: true,
            description: "Project version number, `stable` for your project's stable version, or a valid branch name.",
          },
          {
            schema: { type: 'string' },
            in: 'header',
            name: 'prefer',
            required: false,
            description:
              'By default, the supplied `slug` will be made unique during custom page creation if it already exists, however if you do not want this behavior you can supply `prefer: handling=strict` to receive a 409 Conflict instead.',
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
                              default: 'public',
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
                        renderable: {
                          type: 'object',
                          properties: {
                            status: {
                              type: 'boolean',
                              default: true,
                              description: 'A flag for if the resource is renderable or not.',
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
                        updated_at: {
                          type: 'string',
                          format: 'date-time',
                          description: 'An ISO 8601 formatted date for when the custom page was updated.',
                          nullable: true,
                        },
                        uri: {
                          type: 'string',
                          pattern:
                            '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/custom_pages\\/([a-f\\d]{24}|([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
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
                        'renderable',
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
          'Get all custom pages from your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).',
        parameters: [
          {
            schema: {
              type: 'string',
              pattern: '(v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?',
            },
            in: 'path',
            name: 'branch',
            required: true,
            description: "Project version number, `stable` for your project's stable version, or a valid branch name.",
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
                                default: 'public',
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
                          renderable: {
                            type: 'object',
                            properties: {
                              status: {
                                type: 'boolean',
                                default: true,
                                description: 'A flag for if the resource is renderable or not.',
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
                          updated_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'An ISO 8601 formatted date for when the custom page was updated.',
                            nullable: true,
                          },
                          uri: {
                            type: 'string',
                            pattern:
                              '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/custom_pages\\/([a-f\\d]{24}|([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
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
                          'renderable',
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
    '/branches/{branch}/custom_pages/{slug}': {
      get: {
        operationId: 'getCustomPage',
        summary: 'Get a custom page',
        tags: ['Custom Pages'],
        description:
          'Get a custom page from your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).',
        parameters: [
          {
            schema: {
              type: 'string',
              pattern: '(v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?',
            },
            in: 'path',
            name: 'branch',
            required: true,
            description: "Project version number, `stable` for your project's stable version, or a valid branch name.",
          },
          {
            schema: { type: 'string', pattern: '([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+' },
            in: 'path',
            name: 'slug',
            required: true,
            description: 'A URL-safe representation of the resource.',
          },
          {
            schema: { type: 'string' },
            in: 'header',
            name: 'if-none-match',
            required: false,
            description: 'An ETag value to compare against the resource.',
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
                              default: 'public',
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
                        renderable: {
                          type: 'object',
                          properties: {
                            status: {
                              type: 'boolean',
                              default: true,
                              description: 'A flag for if the resource is renderable or not.',
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
                        updated_at: {
                          type: 'string',
                          format: 'date-time',
                          description: 'An ISO 8601 formatted date for when the custom page was updated.',
                          nullable: true,
                        },
                        uri: {
                          type: 'string',
                          pattern:
                            '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/custom_pages\\/([a-f\\d]{24}|([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
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
                        'renderable',
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
          '304': { description: 'Not Modified', content: { 'application/json': { schema: {} } } },
        },
      },
      delete: {
        operationId: 'deleteCustomPage',
        summary: 'Delete a custom page',
        tags: ['Custom Pages'],
        description:
          'Delete a custom page from your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).',
        parameters: [
          {
            schema: {
              type: 'string',
              pattern: '(v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?',
            },
            in: 'path',
            name: 'branch',
            required: true,
            description: "Project version number, `stable` for your project's stable version, or a valid branch name.",
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
          'Update an existing custom page in your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).',
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
                        default: 'public',
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
            schema: {
              type: 'string',
              pattern: '(v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?',
            },
            in: 'path',
            name: 'branch',
            required: true,
            description: "Project version number, `stable` for your project's stable version, or a valid branch name.",
          },
          {
            schema: { type: 'string', pattern: '([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+' },
            in: 'path',
            name: 'slug',
            required: true,
            description: 'A URL-safe representation of the resource.',
          },
          {
            schema: { type: 'string' },
            in: 'header',
            name: 'prefer',
            required: false,
            description:
              'By default, the supplied `slug` will be made unique during custom page updates if it already exists, however if you do not want this behavior you can supply `prefer: handling=strict` to receive a 409 Conflict instead.',
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
                              default: 'public',
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
                        renderable: {
                          type: 'object',
                          properties: {
                            status: {
                              type: 'boolean',
                              default: true,
                              description: 'A flag for if the resource is renderable or not.',
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
                        updated_at: {
                          type: 'string',
                          format: 'date-time',
                          description: 'An ISO 8601 formatted date for when the custom page was updated.',
                          nullable: true,
                        },
                        uri: {
                          type: 'string',
                          pattern:
                            '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/custom_pages\\/([a-f\\d]{24}|([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
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
                        'renderable',
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
    '/branches/{branch}/guides': {
      post: {
        operationId: 'createGuide',
        summary: 'Create a guides page',
        tags: ['Guides'],
        description:
          'Create a page in the Guides section of your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).',
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
                  appearance: {
                    type: 'object',
                    properties: {
                      icon: {
                        type: 'object',
                        properties: {
                          name: { type: 'string', nullable: true },
                          type: { type: 'string', enum: ['icon', 'emoji'], nullable: true },
                        },
                        additionalProperties: false,
                      },
                    },
                    additionalProperties: false,
                  },
                  category: {
                    type: 'object',
                    properties: {
                      uri: {
                        type: 'string',
                        pattern:
                          '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/categories\\/(guides|reference)\\/((.*))',
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
                                    type: { type: 'string', enum: ['basic', 'endpoint', 'changelog', 'custom_page'] },
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
                  metadata: {
                    type: 'object',
                    properties: {
                      description: { type: 'string', nullable: true },
                      keywords: { type: 'string', nullable: true },
                      title: { type: 'string', nullable: true },
                      x_import: { type: 'string', nullable: true },
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
                          '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/(guides|reference)\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                        nullable: true,
                      },
                    },
                    additionalProperties: false,
                  },
                  privacy: {
                    type: 'object',
                    properties: {
                      view: {
                        type: 'string',
                        enum: ['public', 'anyone_with_link'],
                        default: 'public',
                        description: 'The visibility of this page.',
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
            schema: {
              type: 'string',
              pattern: '(v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?',
            },
            in: 'path',
            name: 'branch',
            required: true,
            description: "Project version number, `stable` for your project's stable version, or a valid branch name.",
          },
          {
            schema: { type: 'string' },
            in: 'header',
            name: 'prefer',
            required: false,
            description:
              'By default, the supplied `slug` will be made unique during guide creation if it already exists, however if you do not want this behavior you can supply `prefer: handling=strict` to receive a 409 Conflict instead.',
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
                        appearance: {
                          type: 'object',
                          properties: {
                            icon: {
                              type: 'object',
                              properties: {
                                name: { type: 'string', nullable: true },
                                type: { type: 'string', enum: ['icon', 'emoji'], nullable: true },
                              },
                              required: ['name', 'type'],
                              additionalProperties: false,
                            },
                          },
                          required: ['icon'],
                          additionalProperties: false,
                        },
                        category: {
                          type: 'object',
                          properties: {
                            uri: {
                              type: 'string',
                              pattern:
                                '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/categories\\/(guides|reference)\\/((.*))',
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
                                          type: {
                                            type: 'string',
                                            enum: ['basic', 'endpoint', 'changelog', 'custom_page'],
                                          },
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
                            x_import: {
                              type: 'string',
                              nullable: true,
                              description:
                                'A URI to the external docs page that this page is being imported from. Set while a page is mid-import and removed once the import completes; its presence signals that the page is read-only and still hydrating.',
                            },
                          },
                          required: ['description', 'image', 'keywords', 'title', 'x_import'],
                          additionalProperties: false,
                        },
                        parent: {
                          type: 'object',
                          properties: {
                            uri: {
                              type: 'string',
                              pattern:
                                '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/(guides|reference)\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
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
                            view: {
                              type: 'string',
                              enum: ['public', 'anyone_with_link'],
                              default: 'public',
                              description: 'The visibility of this page.',
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
                            github_url: {
                              type: 'string',
                              nullable: true,
                              description: 'link to the github of this page',
                            },
                          },
                          required: ['dash', 'hub', 'github_url'],
                          additionalProperties: false,
                        },
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
                              description: 'A flag for if the resource is renderable or not.',
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
                        updated_at: {
                          type: 'string',
                          format: 'date-time',
                          description: 'An ISO 8601 formatted date for when the page was updated.',
                        },
                        uri: {
                          type: 'string',
                          pattern:
                            '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/(guides|reference)\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                          description: 'A URI to the page resource.',
                        },
                      },
                      required: [
                        'appearance',
                        'category',
                        'content',
                        'metadata',
                        'parent',
                        'privacy',
                        'slug',
                        'title',
                        'href',
                        'links',
                        'project',
                        'renderable',
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
    '/branches/{branch}/guides/{slug}': {
      get: {
        operationId: 'getGuide',
        summary: 'Get a guides page',
        tags: ['Guides'],
        description:
          'Get a page from the Guides section of your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).',
        parameters: [
          {
            schema: {
              type: 'string',
              pattern: '(v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?',
            },
            in: 'path',
            name: 'branch',
            required: true,
            description: "Project version number, `stable` for your project's stable version, or a valid branch name.",
          },
          {
            schema: { type: 'string', pattern: '([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+' },
            in: 'path',
            name: 'slug',
            required: true,
            description: 'A URL-safe representation of the resource.',
          },
          {
            schema: { type: 'string' },
            in: 'header',
            name: 'if-none-match',
            required: false,
            description: 'An ETag value to compare against the resource.',
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
                        appearance: {
                          type: 'object',
                          properties: {
                            icon: {
                              type: 'object',
                              properties: {
                                name: { type: 'string', nullable: true },
                                type: { type: 'string', enum: ['icon', 'emoji'], nullable: true },
                              },
                              required: ['name', 'type'],
                              additionalProperties: false,
                            },
                          },
                          required: ['icon'],
                          additionalProperties: false,
                        },
                        category: {
                          type: 'object',
                          properties: {
                            uri: {
                              type: 'string',
                              pattern:
                                '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/categories\\/(guides|reference)\\/((.*))',
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
                                          type: {
                                            type: 'string',
                                            enum: ['basic', 'endpoint', 'changelog', 'custom_page'],
                                          },
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
                            x_import: {
                              type: 'string',
                              nullable: true,
                              description:
                                'A URI to the external docs page that this page is being imported from. Set while a page is mid-import and removed once the import completes; its presence signals that the page is read-only and still hydrating.',
                            },
                          },
                          required: ['description', 'image', 'keywords', 'title', 'x_import'],
                          additionalProperties: false,
                        },
                        parent: {
                          type: 'object',
                          properties: {
                            uri: {
                              type: 'string',
                              pattern:
                                '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/(guides|reference)\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
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
                            view: {
                              type: 'string',
                              enum: ['public', 'anyone_with_link'],
                              default: 'public',
                              description: 'The visibility of this page.',
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
                            github_url: {
                              type: 'string',
                              nullable: true,
                              description: 'link to the github of this page',
                            },
                          },
                          required: ['dash', 'hub', 'github_url'],
                          additionalProperties: false,
                        },
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
                              description: 'A flag for if the resource is renderable or not.',
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
                        updated_at: {
                          type: 'string',
                          format: 'date-time',
                          description: 'An ISO 8601 formatted date for when the page was updated.',
                        },
                        uri: {
                          type: 'string',
                          pattern:
                            '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/(guides|reference)\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                          description: 'A URI to the page resource.',
                        },
                      },
                      required: [
                        'appearance',
                        'category',
                        'content',
                        'metadata',
                        'parent',
                        'privacy',
                        'slug',
                        'title',
                        'href',
                        'links',
                        'project',
                        'renderable',
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
          '304': { description: 'Not Modified', content: { 'application/json': { schema: {} } } },
        },
      },
      delete: {
        operationId: 'deleteGuide',
        summary: 'Delete a guides page',
        tags: ['Guides'],
        description:
          'Delete a page from the Guides section of your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).',
        parameters: [
          {
            schema: {
              type: 'string',
              pattern: '(v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?',
            },
            in: 'path',
            name: 'branch',
            required: true,
            description: "Project version number, `stable` for your project's stable version, or a valid branch name.",
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
          'Updates an existing page in the Guides section of your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).',
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
                  appearance: {
                    type: 'object',
                    properties: {
                      icon: {
                        type: 'object',
                        properties: {
                          name: { type: 'string', nullable: true },
                          type: { type: 'string', enum: ['icon', 'emoji'], nullable: true },
                        },
                        additionalProperties: false,
                      },
                    },
                    additionalProperties: false,
                  },
                  category: {
                    type: 'object',
                    properties: {
                      uri: {
                        type: 'string',
                        pattern:
                          '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/categories\\/(guides|reference)\\/((.*))',
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
                                    type: { type: 'string', enum: ['basic', 'endpoint', 'changelog', 'custom_page'] },
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
                  metadata: {
                    type: 'object',
                    properties: {
                      description: { type: 'string', nullable: true },
                      keywords: { type: 'string', nullable: true },
                      title: { type: 'string', nullable: true },
                      x_import: { type: 'string', nullable: true },
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
                          '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/(guides|reference)\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                        nullable: true,
                      },
                    },
                    additionalProperties: false,
                  },
                  privacy: {
                    type: 'object',
                    properties: {
                      view: {
                        type: 'string',
                        enum: ['public', 'anyone_with_link'],
                        default: 'public',
                        description: 'The visibility of this page.',
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
                  position: { type: 'number' },
                },
                additionalProperties: false,
              },
            },
          },
        },
        parameters: [
          {
            schema: {
              type: 'string',
              pattern: '(v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?',
            },
            in: 'path',
            name: 'branch',
            required: true,
            description: "Project version number, `stable` for your project's stable version, or a valid branch name.",
          },
          {
            schema: { type: 'string', pattern: '([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+' },
            in: 'path',
            name: 'slug',
            required: true,
            description: 'A URL-safe representation of the resource.',
          },
          {
            schema: { type: 'string' },
            in: 'header',
            name: 'prefer',
            required: false,
            description:
              'By default, the supplied `slug` will be made unique during guide updates if it already exists, however if you do not want this behavior you can supply `prefer: handling=strict` to receive a 409 Conflict instead.',
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
                        appearance: {
                          type: 'object',
                          properties: {
                            icon: {
                              type: 'object',
                              properties: {
                                name: { type: 'string', nullable: true },
                                type: { type: 'string', enum: ['icon', 'emoji'], nullable: true },
                              },
                              required: ['name', 'type'],
                              additionalProperties: false,
                            },
                          },
                          required: ['icon'],
                          additionalProperties: false,
                        },
                        category: {
                          type: 'object',
                          properties: {
                            uri: {
                              type: 'string',
                              pattern:
                                '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/categories\\/(guides|reference)\\/((.*))',
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
                                          type: {
                                            type: 'string',
                                            enum: ['basic', 'endpoint', 'changelog', 'custom_page'],
                                          },
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
                            x_import: {
                              type: 'string',
                              nullable: true,
                              description:
                                'A URI to the external docs page that this page is being imported from. Set while a page is mid-import and removed once the import completes; its presence signals that the page is read-only and still hydrating.',
                            },
                          },
                          required: ['description', 'image', 'keywords', 'title', 'x_import'],
                          additionalProperties: false,
                        },
                        parent: {
                          type: 'object',
                          properties: {
                            uri: {
                              type: 'string',
                              pattern:
                                '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/(guides|reference)\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
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
                            view: {
                              type: 'string',
                              enum: ['public', 'anyone_with_link'],
                              default: 'public',
                              description: 'The visibility of this page.',
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
                            github_url: {
                              type: 'string',
                              nullable: true,
                              description: 'link to the github of this page',
                            },
                          },
                          required: ['dash', 'hub', 'github_url'],
                          additionalProperties: false,
                        },
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
                              description: 'A flag for if the resource is renderable or not.',
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
                        updated_at: {
                          type: 'string',
                          format: 'date-time',
                          description: 'An ISO 8601 formatted date for when the page was updated.',
                        },
                        uri: {
                          type: 'string',
                          pattern:
                            '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/(guides|reference)\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                          description: 'A URI to the page resource.',
                        },
                      },
                      required: [
                        'appearance',
                        'category',
                        'content',
                        'metadata',
                        'parent',
                        'privacy',
                        'slug',
                        'title',
                        'href',
                        'links',
                        'project',
                        'renderable',
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
          '204': { description: 'No Content' },
        },
      },
    },
    '/fonts/{slot}': {
      post: {
        operationId: 'uploadFont',
        summary: 'Upload a custom font',
        tags: ['Fonts'],
        description: 'Upload a custom font file for your ReadMe project.',
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: { type: 'object', properties: { file: {} }, additionalProperties: false },
            },
          },
        },
        parameters: [
          {
            schema: { type: 'string', enum: ['heading', 'body_regular', 'body_medium', 'body_semibold', 'code'] },
            in: 'path',
            name: 'slot',
            required: true,
            description: 'The font slot to upload to.',
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
                      properties: { url: { type: 'string' }, filename: { type: 'string' }, format: { type: 'string' } },
                      required: ['url', 'filename', 'format'],
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
    '/images': {
      get: {
        operationId: 'getImages',
        summary: 'Get uploaded images',
        tags: ['Images'],
        description: 'Get a collection of images that were uploaded to your ReadMe project.',
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
      post: {
        operationId: 'uploadImage',
        summary: 'Upload an image',
        tags: ['Images'],
        description: 'Upload an image to your ReadMe project.',
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: { type: 'object', properties: { file: {} }, additionalProperties: false },
            },
          },
        },
        parameters: [
          {
            schema: { type: 'string' },
            in: 'query',
            name: 'resize_height',
            required: false,
            description:
              'If you wish to resize this image, supply a new height in pixels. Please note that GIFs are exempt and cannot be resized.',
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
    '/images/{identifier}': {
      get: {
        operationId: 'getImage',
        summary: 'Get an image',
        tags: ['Images'],
        description: 'Get an image that was uploaded to your ReadMe project.',
        parameters: [
          {
            schema: { type: 'string', pattern: '[a-f\\d]{24}' },
            in: 'path',
            name: 'identifier',
            required: true,
            description: 'A unique identifier for the image.',
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
    '/outbound_ips': {
      get: {
        operationId: 'getOutboundIPs',
        summary: "Get ReadMe's outbound IP addresses",
        tags: ['IP Addresses'],
        description:
          'Get all of ReadMe\'s IP addresses used for outbound webhook requests and the "Try It!" button on the API Explorer.\n\nAlthough ReadMe\'s outbound IP addresses may change, the IPs in this API response will be valid for at least 7 days. If you configure your API or webhooks to limit access based on these IPs, you should refresh the IP list from this endpoint weekly.',
        security: [],
        responses: {
          '200': {
            description: 'List of current IP addresses used for webhook and "Try It!" proxy requests.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: { ip_address: { type: 'string', description: 'The IP address.' } },
                        required: ['ip_address'],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ['data'],
                  additionalProperties: false,
                  description: 'List of current IP addresses used for webhook and "Try It!" proxy requests.',
                },
              },
            },
          },
        },
      },
    },
    '/owlbot/ask': {
      post: {
        operationId: 'askOwlbot',
        summary: 'Ask Owlbot AI a question',
        tags: ['Owlbot AI'],
        description: 'Ask Owlbot a question about the content of your docs.',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  question: { type: 'string', description: 'The question being asked to Owlbot.' },
                  chat_id: {
                    type: 'string',
                    maxLength: 200,
                    description: 'An identifier for the conversation, used for tracing.',
                  },
                  message_id: {
                    type: 'string',
                    maxLength: 200,
                    description: 'An identifier for the message, used for tracing.',
                  },
                },
                required: ['question'],
                additionalProperties: false,
              },
            },
          },
          required: true,
        },
        parameters: [
          {
            schema: { type: 'string', enum: ['application/json', 'text/event-stream'], default: 'application/json' },
            in: 'header',
            name: 'accept',
            required: false,
            description:
              'The format the response should be returned in. If `text/event-stream` then the response will be streamed as it is generated.',
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
                        answer: { type: 'string' },
                        sources: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              title: { type: 'string', description: 'The page title for the given source.' },
                              url: { type: 'string', description: 'A link to the source.' },
                            },
                            required: ['title', 'url'],
                            additionalProperties: false,
                          },
                        },
                      },
                      required: ['answer', 'sources'],
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
    '/owlbot/export': {
      post: {
        operationId: 'exportOwlbotLogs',
        summary: 'Export Owlbot QA logs as CSV',
        tags: ['Owlbot AI'],
        description:
          'Kicks off an async export of Owlbot QA logs as a CSV file. Returns an export ID that can be used to poll for the result via `GET /owlbot/export/:id`.',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  range_start: {
                    type: 'string',
                    pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                    description:
                      'Start date for the export range (YYYY-MM-DD format, e.g. "2025-01-01"). Defaults to 30 days ago.',
                  },
                  range_end: {
                    type: 'string',
                    pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                    description:
                      'End date for the export range (YYYY-MM-DD format, e.g. "2025-01-31"). Defaults to today.',
                  },
                },
                additionalProperties: false,
              },
            },
          },
        },
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
                        id: {
                          type: 'string',
                          pattern: '^owlbot-logs-',
                          description: 'The export ID. Poll `GET /owlbot/export/:id` to retrieve the download URL.',
                        },
                      },
                      required: ['id'],
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
    '/owlbot/export/{id}': {
      get: {
        operationId: 'getOwlbotExport',
        summary: 'Retrieve an Owlbot export',
        tags: ['Owlbot AI'],
        description:
          'Check the status of an Owlbot QA log export. Returns a signed download URL when the export is ready, or a 202 if still processing.',
        parameters: [
          {
            schema: { type: 'string', pattern: '^owlbot-logs-' },
            in: 'path',
            name: 'id',
            required: true,
            description: 'The export ID returned by `POST /owlbot/export`.',
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
                        url: {
                          type: 'string',
                          description: 'A signed URL to download the exported CSV. Expires in 10 minutes.',
                        },
                      },
                      required: ['url'],
                      additionalProperties: false,
                    },
                  },
                  required: ['data'],
                  additionalProperties: false,
                },
              },
            },
          },
          '202': { description: 'Accepted' },
        },
      },
    },
    '/projects/me': {
      get: {
        operationId: 'getProject',
        summary: 'Get project metadata',
        tags: ['Projects'],
        description: 'Returns data about your project.',
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
                        ai: {
                          type: 'object',
                          properties: {
                            chat: {
                              type: 'object',
                              properties: {
                                knowledge: {
                                  type: 'object',
                                  properties: {
                                    custom_knowledge: {
                                      type: 'string',
                                      nullable: true,
                                      default: null,
                                      description: 'Custom knowledge content for AI chat.',
                                    },
                                    use_project_knowledge: {
                                      type: 'boolean',
                                      default: false,
                                      description: 'Whether to use project indexing for AI chat.',
                                    },
                                  },
                                  additionalProperties: false,
                                },
                                models: {
                                  type: 'array',
                                  items: {
                                    type: 'object',
                                    properties: {
                                      enabled: { type: 'boolean', default: false },
                                      id: { type: 'string' },
                                      provider: { type: 'string' },
                                      name: { type: 'string' },
                                    },
                                    required: ['id', 'provider', 'name'],
                                    additionalProperties: false,
                                  },
                                  default: [],
                                  description: 'AI models configuration for chat.',
                                },
                              },
                              required: ['knowledge'],
                              additionalProperties: false,
                              description: 'AI chat configuration for the project.',
                            },
                            owlbot: {
                              type: 'object',
                              properties: {
                                enabled: {
                                  type: 'boolean',
                                  default: false,
                                  description: 'Whether the Owlbot AI add-on is enabled.',
                                },
                                new_experience: {
                                  type: 'boolean',
                                  default: true,
                                  description: 'Whether to use the new Owlbot experience.',
                                },
                                v2: {
                                  type: 'boolean',
                                  default: false,
                                  description: 'Whether agentic AI chat (v2) with UIMessage format is enabled.',
                                },
                                is_paying: {
                                  type: 'boolean',
                                  default: false,
                                  description: 'Whether the customer is paying for the AI Booster Pack.',
                                },
                                trial: {
                                  type: 'object',
                                  properties: {
                                    is_paying: {
                                      type: 'boolean',
                                      default: false,
                                      description: 'Whether the trial user has enabled the AI Booster Pack.',
                                    },
                                  },
                                  additionalProperties: false,
                                },
                              },
                              required: ['trial'],
                              additionalProperties: false,
                              description: 'AI Owlbot configuration for the project.',
                            },
                          },
                          required: ['chat', 'owlbot'],
                          additionalProperties: false,
                          description: 'AI configuration for the project.',
                        },
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
                                link_color_dark: { type: 'string', nullable: true },
                                theme: { type: 'string', enum: ['system', 'light', 'dark'], default: 'light' },
                              },
                              required: ['primary_color', 'link_color', 'link_color_dark'],
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
                            layout: {
                              type: 'object',
                              properties: {
                                full_width: {
                                  type: 'string',
                                  enum: ['enabled', 'disabled'],
                                  default: 'disabled',
                                  description: 'Should the page layout stretch to use the full page width?',
                                },
                                style: {
                                  type: 'string',
                                  enum: ['classic', 'modern', 'compact', 'sidebar'],
                                  default: 'classic',
                                  description: 'The shape and style of your documentation hub pages.',
                                },
                              },
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
                            typography: {
                              type: 'object',
                              properties: {
                                heading_font: {
                                  type: 'string',
                                  nullable: true,
                                  default: null,
                                  description:
                                    'The font family used for headings. When null, the system default font stack is used.',
                                },
                                body_font: {
                                  type: 'string',
                                  nullable: true,
                                  default: null,
                                  description:
                                    'The font family used for body text. When null, the system default font stack is used.',
                                },
                                code_font: {
                                  type: 'string',
                                  nullable: true,
                                  default: null,
                                  description:
                                    'The font family used for code blocks. When null, the system default monospace font stack is used.',
                                },
                                spacing: { type: 'string', enum: ['comfortable', 'condensed'], nullable: true },
                                custom_heading: {
                                  type: 'object',
                                  properties: {
                                    url: { type: 'string', nullable: true },
                                    filename: { type: 'string', nullable: true },
                                    format: {
                                      type: 'string',
                                      enum: ['woff2', 'woff', 'truetype', 'opentype'],
                                      nullable: true,
                                    },
                                  },
                                  required: ['url', 'filename', 'format'],
                                  additionalProperties: false,
                                  description: 'Custom uploaded font for headings.',
                                },
                                custom_body: {
                                  type: 'object',
                                  properties: {
                                    regular: {
                                      type: 'object',
                                      properties: {
                                        url: { type: 'string', nullable: true },
                                        filename: { type: 'string', nullable: true },
                                        format: {
                                          type: 'string',
                                          enum: ['woff2', 'woff', 'truetype', 'opentype'],
                                          nullable: true,
                                        },
                                      },
                                      required: ['url', 'filename', 'format'],
                                      additionalProperties: false,
                                    },
                                    medium: {
                                      type: 'object',
                                      properties: {
                                        url: { type: 'string', nullable: true },
                                        filename: { type: 'string', nullable: true },
                                        format: {
                                          type: 'string',
                                          enum: ['woff2', 'woff', 'truetype', 'opentype'],
                                          nullable: true,
                                        },
                                      },
                                      required: ['url', 'filename', 'format'],
                                      additionalProperties: false,
                                    },
                                    semibold: {
                                      type: 'object',
                                      properties: {
                                        url: { type: 'string', nullable: true },
                                        filename: { type: 'string', nullable: true },
                                        format: {
                                          type: 'string',
                                          enum: ['woff2', 'woff', 'truetype', 'opentype'],
                                          nullable: true,
                                        },
                                      },
                                      required: ['url', 'filename', 'format'],
                                      additionalProperties: false,
                                    },
                                  },
                                  required: ['regular', 'medium', 'semibold'],
                                  additionalProperties: false,
                                  description:
                                    'Custom uploaded fonts for body text. Supports regular (400), medium (500), and semibold (600) weights.',
                                },
                                custom_code: {
                                  type: 'object',
                                  properties: {
                                    url: { type: 'string', nullable: true },
                                    filename: { type: 'string', nullable: true },
                                    format: {
                                      type: 'string',
                                      enum: ['woff2', 'woff', 'truetype', 'opentype'],
                                      nullable: true,
                                    },
                                  },
                                  required: ['url', 'filename', 'format'],
                                  additionalProperties: false,
                                  description: 'Custom uploaded font for code blocks.',
                                },
                              },
                              required: ['spacing', 'custom_heading', 'custom_body', 'custom_code'],
                              additionalProperties: false,
                            },
                            navigation: {
                              type: 'object',
                              properties: {
                                collapsible_categories: {
                                  type: 'string',
                                  enum: ['enabled', 'disabled'],
                                  default: 'disabled',
                                  description: 'Should categories be collapsible?',
                                },
                                breadcrumbs: {
                                  type: 'string',
                                  enum: ['enabled', 'disabled'],
                                  default: 'disabled',
                                  description:
                                    'Should navigation breadcrumbs appear on your guides and API reference pages?',
                                },
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
                                        schema: { type: 'string', format: 'uri', nullable: true },
                                      },
                                      required: ['label', 'schema'],
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
                                page_icons: {
                                  type: 'string',
                                  enum: ['enabled', 'disabled'],
                                  default: 'enabled',
                                  description: 'Should the links in your project navigation bar include icons?',
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
                            ai: {
                              type: 'object',
                              properties: {
                                dropdown: {
                                  type: 'string',
                                  enum: ['enabled', 'disabled'],
                                  default: 'disabled',
                                  description: 'Should your pages show a share with AI dropdown?',
                                },
                                options: {
                                  type: 'object',
                                  properties: {
                                    ask_ai: {
                                      type: 'string',
                                      enum: ['enabled', 'disabled'],
                                      default: 'disabled',
                                      description: 'Enable "Ask AI" in the AI dropdown.',
                                    },
                                    chatgpt: {
                                      type: 'string',
                                      enum: ['enabled', 'disabled'],
                                      default: 'enabled',
                                      description: 'Enable ChatGPT in the AI dropdown.',
                                    },
                                    claude: {
                                      type: 'string',
                                      enum: ['enabled', 'disabled'],
                                      default: 'enabled',
                                      description: 'Enable Claude in the AI dropdown.',
                                    },
                                    clipboard: {
                                      type: 'string',
                                      enum: ['enabled', 'disabled'],
                                      default: 'enabled',
                                      description: 'Enable "Copy to Clipboard" within in the AI dropdown.',
                                    },
                                    mcp: {
                                      type: 'object',
                                      properties: {
                                        command: {
                                          type: 'string',
                                          enum: ['enabled', 'disabled'],
                                          default: 'enabled',
                                          description: 'Enable "Copy MCP Command" option in the AI dropdown.',
                                        },
                                        config: {
                                          type: 'string',
                                          enum: ['enabled', 'disabled'],
                                          default: 'enabled',
                                          description: 'Enable "Copy MCP Config" option in the AI dropdown.',
                                        },
                                        cursor: {
                                          type: 'string',
                                          enum: ['enabled', 'disabled'],
                                          default: 'enabled',
                                          description: 'Enable "Connect to Cursor" MCP option in the AI dropdown.',
                                        },
                                        vscode: {
                                          type: 'string',
                                          enum: ['enabled', 'disabled'],
                                          default: 'enabled',
                                          description: 'Enable "Connect to VS Code" MCP option in the AI dropdown.',
                                        },
                                      },
                                      additionalProperties: false,
                                    },
                                    view_as_markdown: {
                                      type: 'string',
                                      enum: ['enabled', 'disabled'],
                                      default: 'enabled',
                                      description: 'Enable "View as Markdown" in the AI dropdown.',
                                    },
                                  },
                                  required: ['mcp'],
                                  additionalProperties: false,
                                },
                              },
                              required: ['options'],
                              additionalProperties: false,
                            },
                            landing_page: {
                              type: 'object',
                              properties: {
                                promo: {
                                  type: 'object',
                                  properties: {
                                    title: {
                                      type: 'string',
                                      nullable: true,
                                      description: 'Landing page hero section title.',
                                    },
                                    text: {
                                      type: 'string',
                                      nullable: true,
                                      description: 'Landing page hero section text.',
                                    },
                                    content_type: {
                                      type: 'string',
                                      enum: ['none', 'buttons', 'search', 'html'],
                                      default: 'none',
                                      description: 'Landing page hero section content.',
                                    },
                                    html: {
                                      type: 'string',
                                      nullable: true,
                                      description: 'Custom HTML for the landing page hero section.',
                                    },
                                    button_primary: {
                                      type: 'string',
                                      nullable: true,
                                      description: 'Primary action for the landing page hero section.',
                                    },
                                    button_secondary: {
                                      type: 'string',
                                      nullable: true,
                                      description: 'Secondary action for the landing page hero section.',
                                    },
                                  },
                                  required: ['title', 'text', 'html', 'button_primary', 'button_secondary'],
                                  additionalProperties: false,
                                },
                                sections: {
                                  type: 'array',
                                  items: {
                                    type: 'object',
                                    properties: {
                                      type: {
                                        type: 'string',
                                        enum: ['links', 'docs', 'text', 'text-media', 'three', 'html'],
                                      },
                                      alignment: { type: 'string', enum: ['left', 'center', 'right'], nullable: true },
                                      title: { type: 'string', nullable: true },
                                      text: { type: 'string', nullable: true },
                                      html: { type: 'string', nullable: true },
                                      page_type: {
                                        type: 'string',
                                        enum: ['Documentation', 'Reference'],
                                        nullable: true,
                                      },
                                      side: { type: 'string', enum: ['left', 'right'], nullable: true },
                                      media_type: { type: 'string', enum: ['html', 'image', 'code'], nullable: true },
                                      media_html: { type: 'string', nullable: true },
                                      media_image: { type: 'string', nullable: true },
                                      media_code: { type: 'string', nullable: true },
                                      group0: {
                                        type: 'object',
                                        properties: {
                                          title: { type: 'string', nullable: true },
                                          text: { type: 'string', nullable: true },
                                        },
                                        required: ['title', 'text'],
                                        additionalProperties: false,
                                        nullable: true,
                                      },
                                      group1: {
                                        type: 'object',
                                        properties: {
                                          title: { type: 'string', nullable: true },
                                          text: { type: 'string', nullable: true },
                                        },
                                        required: ['title', 'text'],
                                        additionalProperties: false,
                                        nullable: true,
                                      },
                                      group2: {
                                        type: 'object',
                                        properties: {
                                          title: { type: 'string', nullable: true },
                                          text: { type: 'string', nullable: true },
                                        },
                                        required: ['title', 'text'],
                                        additionalProperties: false,
                                        nullable: true,
                                      },
                                    },
                                    required: [
                                      'type',
                                      'alignment',
                                      'title',
                                      'text',
                                      'html',
                                      'page_type',
                                      'side',
                                      'media_type',
                                      'media_html',
                                      'media_image',
                                      'media_code',
                                      'group0',
                                      'group1',
                                      'group2',
                                    ],
                                    additionalProperties: false,
                                  },
                                  description: 'Landing page content.',
                                },
                              },
                              required: ['promo', 'sections'],
                              additionalProperties: false,
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
                            'layout',
                            'logo',
                            'markdown',
                            'typography',
                            'navigation',
                            'ai',
                            'landing_page',
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
                            jwt_expiration_time: { type: 'number' },
                            login_url: { type: 'string', nullable: true },
                            logout_url: { type: 'string', nullable: true },
                          },
                          required: ['jwt_secret', 'jwt_expiration_time', 'login_url', 'logout_url'],
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
                        i18n: {
                          type: 'object',
                          properties: {
                            defaultLanguage: {
                              type: 'string',
                              enum: ['en', 'de', 'es', 'fr', 'it', 'ja', 'ko', 'nl', 'pt', 'zh'],
                              description: 'The primary language used for this project.',
                            },
                            languages: {
                              type: 'array',
                              items: {
                                type: 'string',
                                enum: ['en', 'de', 'es', 'fr', 'it', 'ja', 'ko', 'nl', 'pt', 'zh'],
                              },
                              description: 'The list of languages this project supports.',
                            },
                            state: {
                              type: 'string',
                              enum: ['disabled', 'enabled'],
                              description: 'If internationalization support is enabled or disabled.',
                            },
                          },
                          required: ['defaultLanguage', 'languages', 'state'],
                          additionalProperties: false,
                          description: 'Internationalization settings for the project.',
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
                            postman: {
                              type: 'object',
                              properties: {
                                key: { type: 'string', nullable: true },
                                client_id: { type: 'string', nullable: true },
                                client_secret: { type: 'string', nullable: true },
                                is_connected: { type: 'boolean' },
                              },
                              required: ['key', 'client_id', 'client_secret', 'is_connected'],
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
                            speakeasy: {
                              type: 'object',
                              properties: {
                                key: { type: 'string', nullable: true, description: 'The API key for Speakeasy.' },
                                spec_url: {
                                  type: 'string',
                                  nullable: true,
                                  description: 'The URL to the Speakeasy spec file.',
                                },
                              },
                              required: ['key', 'spec_url'],
                              additionalProperties: false,
                            },
                            stainless: {
                              type: 'object',
                              properties: {
                                key: { type: 'string', nullable: true, description: 'The API key for Stainless.' },
                                name: {
                                  type: 'string',
                                  nullable: true,
                                  description: 'The name of the Stainless project.',
                                },
                              },
                              required: ['key', 'name'],
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
                            'postman',
                            'koala',
                            'localize',
                            'recaptcha',
                            'segment',
                            'speakeasy',
                            'stainless',
                            'typekit',
                            'zendesk',
                          ],
                          additionalProperties: false,
                        },
                        mcp: {
                          type: 'object',
                          properties: {
                            state: {
                              type: 'string',
                              enum: ['enabled', 'disabled'],
                              default: 'disabled',
                              description: "The availability of the project's MCP server.",
                            },
                            custom_tools: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  title: { type: 'string', description: 'The title of the tool.' },
                                  description: { type: 'string', description: 'The description of the tool.' },
                                  body: { type: 'string', description: 'The body of the tool.' },
                                },
                                required: ['title', 'description', 'body'],
                                additionalProperties: false,
                              },
                              default: [],
                              description: 'Custom tools that the user can add to the MCP server.',
                            },
                            disabled_routes: {
                              type: 'array',
                              items: { type: 'string' },
                              default: [],
                              description: 'Array of route paths that are disabled in the MCP server.',
                            },
                            disabled_tools: {
                              type: 'array',
                              items: { type: 'string' },
                              default: [],
                              description:
                                'Array of tool names that will be prevented from being added to the MCP server.',
                            },
                            has_password: {
                              type: 'boolean',
                              default: false,
                              description: 'Whether the MCP server has a password set. Read-only.',
                            },
                            privacy: {
                              type: 'object',
                              properties: {
                                password: {
                                  type: 'string',
                                  nullable: true,
                                  default: null,
                                  description:
                                    'Set a password for MCP server access. When set, users must provide this password or an API key to access the MCP server. This field can be set, but it will not be returned by the API.',
                                },
                              },
                              additionalProperties: false,
                              default: { password: null },
                              description: 'Privacy settings for the MCP server.',
                            },
                          },
                          additionalProperties: false,
                          description: "Configuration for the project's Model Context Protocol (MCP) server.",
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
                            ai_ready: { type: 'boolean', default: false },
                          },
                          additionalProperties: false,
                        },
                        pages: {
                          type: 'object',
                          properties: {
                            not_found: {
                              type: 'string',
                              pattern:
                                '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/custom_pages\\/([a-f\\d]{24}|([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                              nullable: true,
                              description:
                                'The page you wish to be served to your users when they encounter a 404. This can either map to the `uri` of a Custom Page on your project or be set to `null`. If `null` then the default ReadMe 404 page will be served. The version within the `uri` must be mapped to your stable version.',
                            },
                            default_visibility: {
                              type: 'string',
                              enum: ['public', 'anyone_with_link'],
                              default: 'public',
                              description: 'The default visibility for pages when they are initially created.',
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
                        owner: {
                          type: 'object',
                          properties: {
                            id: {
                              type: 'string',
                              nullable: true,
                              description: 'The unique identifier of the project owner.',
                            },
                            email: {
                              type: 'string',
                              nullable: true,
                              description: 'The email of the project owner. Only visible to god-mode users.',
                            },
                            name: {
                              type: 'string',
                              nullable: true,
                              description: 'The name of the project owner. Only visible to god-mode users.',
                            },
                          },
                          required: ['id', 'email', 'name'],
                          additionalProperties: false,
                          description: 'Information about the project owner.',
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
                                'freelaunch2026',
                                'opensource',
                                'pro2026',
                                'pro2026-annual',
                                'startup',
                                'startup2018',
                                'startup-annual-2024',
                              ],
                              default: 'free',
                            },
                            override: {
                              type: 'string',
                              nullable: true,
                              default: null,
                              description: 'The plan override for the project. Only visible to god-mode users.',
                            },
                            grace_period: {
                              type: 'object',
                              properties: {
                                enabled: { type: 'boolean', default: false },
                                end_date: { type: 'string', format: 'date-time', nullable: true, default: null },
                              },
                              additionalProperties: false,
                            },
                            stripe_subscription_id: {
                              type: 'string',
                              nullable: true,
                              default: null,
                              description:
                                'The Stripe subscription ID for the project. Only visible to god-mode users.',
                            },
                            trial: {
                              type: 'object',
                              properties: {
                                active: {
                                  type: 'boolean',
                                  default: false,
                                  description: 'Whether the project is currently in an active trial.',
                                },
                                enabled: {
                                  type: 'boolean',
                                  nullable: true,
                                  default: null,
                                  description: 'Whether the trial deadline is enabled. Only visible to god-mode users.',
                                },
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
                        metrics: {
                          type: 'object',
                          properties: {
                            monthly_purchase_limit: {
                              type: 'number',
                              default: 0,
                              description: 'The monthly purchase limit for the Developer Dashboard add-on.',
                            },
                            monthly_limit: {
                              type: 'number',
                              default: 0,
                              description: 'The monthly limit for the API Logs.',
                            },
                          },
                          additionalProperties: false,
                        },
                        privacy: {
                          type: 'object',
                          properties: {
                            openapi: {
                              type: 'string',
                              enum: ['public', 'admin'],
                              default: 'admin',
                              description: "The visibility your OpenAPI definitions on your project's `/openapi` page.",
                            },
                            password: {
                              type: 'string',
                              nullable: true,
                              description:
                                "The project's password for when `privacy.view` is `password`. This field can be set, but it will not be returned by the API.",
                            },
                            view: {
                              type: 'string',
                              enum: ['public', 'admin', 'password', 'custom_login'],
                              default: 'public',
                              description:
                                '* `public` - Site is available to the public.\n* `admin` - Site is only available to users that have project permissions.\n* `password` - Site is gated behind a password authentication system.\n* `custom_login` - Users who view your site will be forwarded to a URL of your choice, having them login there and be forwarded back to your ReadMe site.',
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
                            experimental_performance_mode: {
                              type: 'string',
                              enum: ['enabled', 'disabled'],
                              default: 'disabled',
                              description:
                                'Should the experimental performance mode be enabled? This will reduce the size of API definitions that we used within API Reference pages and should overall improve page load times. Please note that this feature is still very experimental and will be eventually enabled for all customers.',
                            },
                            sdk_snippets: {
                              type: 'object',
                              properties: {
                                external: {
                                  type: 'string',
                                  enum: ['active', 'disabled', 'enabled'],
                                  default: 'disabled',
                                  description: 'State of external SDK snippets feature.',
                                },
                              },
                              additionalProperties: false,
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
                            method_badge_style: {
                              type: 'string',
                              enum: ['classic', 'modern'],
                              default: 'classic',
                              description: 'The style of the HTTP method badges used in the API Reference.',
                            },
                            request_examples: {
                              type: 'string',
                              enum: ['expanded', 'collapsed'],
                              default: 'collapsed',
                              description:
                                'When `expanded`, the first available request example auto-populates the request form.',
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
                            show_method_in_sidebar: {
                              type: 'string',
                              enum: ['enabled', 'disabled'],
                              default: 'enabled',
                              description: 'When `enabled`, the HTTP method badge will be shown in the sidebar.',
                            },
                          },
                          required: ['sdk_snippets'],
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
                        llms_txt: {
                          type: 'string',
                          enum: ['enabled', 'disabled'],
                          default: 'enabled',
                          description:
                            'Expose an `llms.txt` file to help AI assistants understand your documentation structure.',
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
                        created_at: {
                          type: 'string',
                          format: 'date-time',
                          nullable: true,
                          description: 'The date the project was created.',
                        },
                        updated_at: {
                          type: 'string',
                          format: 'date-time',
                          nullable: true,
                          description: 'The date the project was last updated.',
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
                        feature_rules: {
                          type: 'object',
                          properties: {
                            merge: {
                              type: 'object',
                              properties: {
                                requirements: {
                                  type: 'array',
                                  items: { type: 'string', enum: ['approval', 'lint'] },
                                  default: [],
                                  description: 'Any states that will block the ability to merge a branch.',
                                },
                                allow_override: {
                                  type: 'array',
                                  items: { type: 'string', enum: ['editor'] },
                                  default: [],
                                  description:
                                    'All permission levels lower than Admin that are able to override a merge that is blocked. Admins can always override.',
                                },
                              },
                              additionalProperties: false,
                            },
                          },
                          required: ['merge'],
                          additionalProperties: false,
                        },
                        git: {
                          type: 'object',
                          properties: {
                            repository_name: {
                              type: 'string',
                              nullable: true,
                              default: null,
                              description: 'The internal Git repository name.',
                            },
                            connection: {
                              type: 'object',
                              properties: {
                                repository: {
                                  type: 'object',
                                  properties: {
                                    provider_type: {
                                      type: 'string',
                                      enum: ['github', 'github_enterprise_server', 'bitbucket', 'gitlab'],
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
                                    privacy: {
                                      type: 'object',
                                      properties: {
                                        private: { type: 'boolean' },
                                        visibility: {
                                          type: 'string',
                                          enum: ['public', 'private', 'internal'],
                                          description: 'Whether this repo is private, public, or internal.',
                                        },
                                      },
                                      required: ['private', 'visibility'],
                                      additionalProperties: false,
                                    },
                                    url: {
                                      type: 'string',
                                      format: 'uri',
                                      description:
                                        'The URL of the repository (e.g., `https://github.com/owner-org/repo-with-content`).',
                                    },
                                  },
                                  required: ['provider_type', 'name', 'full_name', 'privacy', 'url'],
                                  additionalProperties: false,
                                  nullable: true,
                                },
                                organization: {
                                  type: 'object',
                                  properties: {
                                    name: {
                                      type: 'string',
                                      description:
                                        'The name of the organization the linked repository is a part of (e.g., `owner-org`).',
                                    },
                                    provider_type: {
                                      type: 'string',
                                      enum: ['github', 'github_enterprise_server', 'bitbucket', 'gitlab'],
                                      description: 'The type of provider for the organization.',
                                    },
                                  },
                                  required: ['name', 'provider_type'],
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
                              required: ['repository', 'organization'],
                              additionalProperties: false,
                            },
                            remediation_status: {
                              type: 'string',
                              enum: ['pending', 'running', 'completed', 'failed'],
                              nullable: true,
                              description: 'Current remediation job status for this project.',
                            },
                            remediated_at: {
                              type: 'string',
                              format: 'date-time',
                              nullable: true,
                              default: null,
                              description: 'ISO timestamp of the last completed remediation run.',
                            },
                            remediation_initiated_by: {
                              type: 'string',
                              nullable: true,
                              default: null,
                              description: 'Email of the user who initiated the last remediation.',
                            },
                            remediation_dry_run: {
                              type: 'boolean',
                              nullable: true,
                              default: null,
                              description: 'Whether the last remediation was a dry run.',
                            },
                            remediation_job_id: {
                              type: 'string',
                              nullable: true,
                              default: null,
                              description: 'BullMQ root job ID of the most recent remediation run.',
                            },
                          },
                          required: ['connection', 'remediation_status'],
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
                            branches: {
                              type: 'object',
                              properties: {
                                merge: {
                                  type: 'object',
                                  properties: {
                                    admin: { type: 'boolean', description: 'Whether admin role can perform merges.' },
                                    editor: { type: 'boolean', description: 'Whether editor role can perform merges.' },
                                  },
                                  required: ['admin', 'editor'],
                                  additionalProperties: false,
                                  description: 'Role-based access control for merging branches',
                                },
                                approve: {
                                  type: 'object',
                                  properties: {
                                    admin: { type: 'boolean', description: 'Whether admin role can approve changes.' },
                                    editor: { type: 'boolean', description: 'Whether editor role can approve changes' },
                                  },
                                  required: ['admin', 'editor'],
                                  additionalProperties: false,
                                  description: 'Role-based access control for approving changes',
                                },
                              },
                              required: ['merge', 'approve'],
                              additionalProperties: false,
                            },
                          },
                          required: ['appearance', 'branches'],
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
                        notification_settings: {
                          type: 'object',
                          properties: {
                            project_topic_key: {
                              type: 'string',
                              nullable: true,
                              default: null,
                              description:
                                'The Novu Topic Key associated with this project for managing notification subscriptions.',
                            },
                          },
                          additionalProperties: false,
                          description: 'Notification settings for the project.',
                        },
                        uri: {
                          type: 'string',
                          pattern: '\\/projects\\/(me|[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*)',
                          description: 'A URI to the project resource.',
                        },
                      },
                      required: [
                        'ai',
                        'api_designer',
                        'appearance',
                        'canonical_url',
                        'custom_login',
                        'default_version',
                        'description',
                        'health_check',
                        'homepage_url',
                        'i18n',
                        'integrations',
                        'mcp',
                        'name',
                        'onboarding_completed',
                        'pages',
                        'parent',
                        'owner',
                        'plan',
                        'metrics',
                        'privacy',
                        'redirects',
                        'reference',
                        'seo',
                        'subdomain',
                        'id',
                        'created_at',
                        'updated_at',
                        'features',
                        'feature_rules',
                        'git',
                        'permissions',
                        'refactored',
                        'notification_settings',
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
    '/projects/me/children': {
      post: {
        operationId: 'createChildProject',
        summary: 'Create a child project on your Enterprise group',
        tags: ['Projects'],
        description:
          'Create a new project and attach it to your Enterrpise group as a child.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).\n\n>❗\n> This route is only available to [ReadMe Enterprise](https://readme.com/enterprise) customers.',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', description: 'The name of the project.' },
                  subdomain: {
                    type: 'string',
                    pattern: '[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*',
                    maxLength: 30,
                    description: 'The subdomain of your project.',
                  },
                  privacy: {
                    type: 'object',
                    properties: {
                      openapi: {
                        type: 'string',
                        enum: ['public', 'admin'],
                        default: 'admin',
                        description: "The visibility your OpenAPI definitions on your project's `/openapi` page.",
                      },
                      password: {
                        type: 'string',
                        nullable: true,
                        description:
                          "The project's password for when `privacy.view` is `password`. This field can be set, but it will not be returned by the API.",
                      },
                      view: {
                        type: 'string',
                        enum: ['public', 'admin', 'password', 'custom_login'],
                        default: 'public',
                        description:
                          '* `public` - Site is available to the public.\n* `admin` - Site is only available to users that have project permissions.\n* `password` - Site is gated behind a password authentication system.\n* `custom_login` - Users who view your site will be forwarded to a URL of your choice, having them login there and be forwarded back to your ReadMe site.',
                      },
                    },
                    required: ['password'],
                    additionalProperties: false,
                  },
                },
                required: ['name', 'subdomain'],
                additionalProperties: false,
              },
            },
          },
          required: true,
        },
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
                        ai: {
                          type: 'object',
                          properties: {
                            chat: {
                              type: 'object',
                              properties: {
                                knowledge: {
                                  type: 'object',
                                  properties: {
                                    custom_knowledge: {
                                      type: 'string',
                                      nullable: true,
                                      default: null,
                                      description: 'Custom knowledge content for AI chat.',
                                    },
                                    use_project_knowledge: {
                                      type: 'boolean',
                                      default: false,
                                      description: 'Whether to use project indexing for AI chat.',
                                    },
                                  },
                                  additionalProperties: false,
                                },
                                models: {
                                  type: 'array',
                                  items: {
                                    type: 'object',
                                    properties: {
                                      enabled: { type: 'boolean', default: false },
                                      id: { type: 'string' },
                                      provider: { type: 'string' },
                                      name: { type: 'string' },
                                    },
                                    required: ['id', 'provider', 'name'],
                                    additionalProperties: false,
                                  },
                                  default: [],
                                  description: 'AI models configuration for chat.',
                                },
                              },
                              required: ['knowledge'],
                              additionalProperties: false,
                              description: 'AI chat configuration for the project.',
                            },
                            owlbot: {
                              type: 'object',
                              properties: {
                                enabled: {
                                  type: 'boolean',
                                  default: false,
                                  description: 'Whether the Owlbot AI add-on is enabled.',
                                },
                                new_experience: {
                                  type: 'boolean',
                                  default: true,
                                  description: 'Whether to use the new Owlbot experience.',
                                },
                                v2: {
                                  type: 'boolean',
                                  default: false,
                                  description: 'Whether agentic AI chat (v2) with UIMessage format is enabled.',
                                },
                                is_paying: {
                                  type: 'boolean',
                                  default: false,
                                  description: 'Whether the customer is paying for the AI Booster Pack.',
                                },
                                trial: {
                                  type: 'object',
                                  properties: {
                                    is_paying: {
                                      type: 'boolean',
                                      default: false,
                                      description: 'Whether the trial user has enabled the AI Booster Pack.',
                                    },
                                  },
                                  additionalProperties: false,
                                },
                              },
                              required: ['trial'],
                              additionalProperties: false,
                              description: 'AI Owlbot configuration for the project.',
                            },
                          },
                          required: ['chat', 'owlbot'],
                          additionalProperties: false,
                          description: 'AI configuration for the project.',
                        },
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
                                link_color_dark: { type: 'string', nullable: true },
                                theme: { type: 'string', enum: ['system', 'light', 'dark'], default: 'light' },
                              },
                              required: ['primary_color', 'link_color', 'link_color_dark'],
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
                            layout: {
                              type: 'object',
                              properties: {
                                full_width: {
                                  type: 'string',
                                  enum: ['enabled', 'disabled'],
                                  default: 'disabled',
                                  description: 'Should the page layout stretch to use the full page width?',
                                },
                                style: {
                                  type: 'string',
                                  enum: ['classic', 'modern', 'compact', 'sidebar'],
                                  default: 'classic',
                                  description: 'The shape and style of your documentation hub pages.',
                                },
                              },
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
                            typography: {
                              type: 'object',
                              properties: {
                                heading_font: {
                                  type: 'string',
                                  nullable: true,
                                  default: null,
                                  description:
                                    'The font family used for headings. When null, the system default font stack is used.',
                                },
                                body_font: {
                                  type: 'string',
                                  nullable: true,
                                  default: null,
                                  description:
                                    'The font family used for body text. When null, the system default font stack is used.',
                                },
                                code_font: {
                                  type: 'string',
                                  nullable: true,
                                  default: null,
                                  description:
                                    'The font family used for code blocks. When null, the system default monospace font stack is used.',
                                },
                                spacing: { type: 'string', enum: ['comfortable', 'condensed'], nullable: true },
                                custom_heading: {
                                  type: 'object',
                                  properties: {
                                    url: { type: 'string', nullable: true },
                                    filename: { type: 'string', nullable: true },
                                    format: {
                                      type: 'string',
                                      enum: ['woff2', 'woff', 'truetype', 'opentype'],
                                      nullable: true,
                                    },
                                  },
                                  required: ['url', 'filename', 'format'],
                                  additionalProperties: false,
                                  description: 'Custom uploaded font for headings.',
                                },
                                custom_body: {
                                  type: 'object',
                                  properties: {
                                    regular: {
                                      type: 'object',
                                      properties: {
                                        url: { type: 'string', nullable: true },
                                        filename: { type: 'string', nullable: true },
                                        format: {
                                          type: 'string',
                                          enum: ['woff2', 'woff', 'truetype', 'opentype'],
                                          nullable: true,
                                        },
                                      },
                                      required: ['url', 'filename', 'format'],
                                      additionalProperties: false,
                                    },
                                    medium: {
                                      type: 'object',
                                      properties: {
                                        url: { type: 'string', nullable: true },
                                        filename: { type: 'string', nullable: true },
                                        format: {
                                          type: 'string',
                                          enum: ['woff2', 'woff', 'truetype', 'opentype'],
                                          nullable: true,
                                        },
                                      },
                                      required: ['url', 'filename', 'format'],
                                      additionalProperties: false,
                                    },
                                    semibold: {
                                      type: 'object',
                                      properties: {
                                        url: { type: 'string', nullable: true },
                                        filename: { type: 'string', nullable: true },
                                        format: {
                                          type: 'string',
                                          enum: ['woff2', 'woff', 'truetype', 'opentype'],
                                          nullable: true,
                                        },
                                      },
                                      required: ['url', 'filename', 'format'],
                                      additionalProperties: false,
                                    },
                                  },
                                  required: ['regular', 'medium', 'semibold'],
                                  additionalProperties: false,
                                  description:
                                    'Custom uploaded fonts for body text. Supports regular (400), medium (500), and semibold (600) weights.',
                                },
                                custom_code: {
                                  type: 'object',
                                  properties: {
                                    url: { type: 'string', nullable: true },
                                    filename: { type: 'string', nullable: true },
                                    format: {
                                      type: 'string',
                                      enum: ['woff2', 'woff', 'truetype', 'opentype'],
                                      nullable: true,
                                    },
                                  },
                                  required: ['url', 'filename', 'format'],
                                  additionalProperties: false,
                                  description: 'Custom uploaded font for code blocks.',
                                },
                              },
                              required: ['spacing', 'custom_heading', 'custom_body', 'custom_code'],
                              additionalProperties: false,
                            },
                            navigation: {
                              type: 'object',
                              properties: {
                                collapsible_categories: {
                                  type: 'string',
                                  enum: ['enabled', 'disabled'],
                                  default: 'disabled',
                                  description: 'Should categories be collapsible?',
                                },
                                breadcrumbs: {
                                  type: 'string',
                                  enum: ['enabled', 'disabled'],
                                  default: 'disabled',
                                  description:
                                    'Should navigation breadcrumbs appear on your guides and API reference pages?',
                                },
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
                                        schema: { type: 'string', format: 'uri', nullable: true },
                                      },
                                      required: ['label', 'schema'],
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
                                page_icons: {
                                  type: 'string',
                                  enum: ['enabled', 'disabled'],
                                  default: 'enabled',
                                  description: 'Should the links in your project navigation bar include icons?',
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
                            ai: {
                              type: 'object',
                              properties: {
                                dropdown: {
                                  type: 'string',
                                  enum: ['enabled', 'disabled'],
                                  default: 'disabled',
                                  description: 'Should your pages show a share with AI dropdown?',
                                },
                                options: {
                                  type: 'object',
                                  properties: {
                                    ask_ai: {
                                      type: 'string',
                                      enum: ['enabled', 'disabled'],
                                      default: 'disabled',
                                      description: 'Enable "Ask AI" in the AI dropdown.',
                                    },
                                    chatgpt: {
                                      type: 'string',
                                      enum: ['enabled', 'disabled'],
                                      default: 'enabled',
                                      description: 'Enable ChatGPT in the AI dropdown.',
                                    },
                                    claude: {
                                      type: 'string',
                                      enum: ['enabled', 'disabled'],
                                      default: 'enabled',
                                      description: 'Enable Claude in the AI dropdown.',
                                    },
                                    clipboard: {
                                      type: 'string',
                                      enum: ['enabled', 'disabled'],
                                      default: 'enabled',
                                      description: 'Enable "Copy to Clipboard" within in the AI dropdown.',
                                    },
                                    mcp: {
                                      type: 'object',
                                      properties: {
                                        command: {
                                          type: 'string',
                                          enum: ['enabled', 'disabled'],
                                          default: 'enabled',
                                          description: 'Enable "Copy MCP Command" option in the AI dropdown.',
                                        },
                                        config: {
                                          type: 'string',
                                          enum: ['enabled', 'disabled'],
                                          default: 'enabled',
                                          description: 'Enable "Copy MCP Config" option in the AI dropdown.',
                                        },
                                        cursor: {
                                          type: 'string',
                                          enum: ['enabled', 'disabled'],
                                          default: 'enabled',
                                          description: 'Enable "Connect to Cursor" MCP option in the AI dropdown.',
                                        },
                                        vscode: {
                                          type: 'string',
                                          enum: ['enabled', 'disabled'],
                                          default: 'enabled',
                                          description: 'Enable "Connect to VS Code" MCP option in the AI dropdown.',
                                        },
                                      },
                                      additionalProperties: false,
                                    },
                                    view_as_markdown: {
                                      type: 'string',
                                      enum: ['enabled', 'disabled'],
                                      default: 'enabled',
                                      description: 'Enable "View as Markdown" in the AI dropdown.',
                                    },
                                  },
                                  required: ['mcp'],
                                  additionalProperties: false,
                                },
                              },
                              required: ['options'],
                              additionalProperties: false,
                            },
                            landing_page: {
                              type: 'object',
                              properties: {
                                promo: {
                                  type: 'object',
                                  properties: {
                                    title: {
                                      type: 'string',
                                      nullable: true,
                                      description: 'Landing page hero section title.',
                                    },
                                    text: {
                                      type: 'string',
                                      nullable: true,
                                      description: 'Landing page hero section text.',
                                    },
                                    content_type: {
                                      type: 'string',
                                      enum: ['none', 'buttons', 'search', 'html'],
                                      default: 'none',
                                      description: 'Landing page hero section content.',
                                    },
                                    html: {
                                      type: 'string',
                                      nullable: true,
                                      description: 'Custom HTML for the landing page hero section.',
                                    },
                                    button_primary: {
                                      type: 'string',
                                      nullable: true,
                                      description: 'Primary action for the landing page hero section.',
                                    },
                                    button_secondary: {
                                      type: 'string',
                                      nullable: true,
                                      description: 'Secondary action for the landing page hero section.',
                                    },
                                  },
                                  required: ['title', 'text', 'html', 'button_primary', 'button_secondary'],
                                  additionalProperties: false,
                                },
                                sections: {
                                  type: 'array',
                                  items: {
                                    type: 'object',
                                    properties: {
                                      type: {
                                        type: 'string',
                                        enum: ['links', 'docs', 'text', 'text-media', 'three', 'html'],
                                      },
                                      alignment: { type: 'string', enum: ['left', 'center', 'right'], nullable: true },
                                      title: { type: 'string', nullable: true },
                                      text: { type: 'string', nullable: true },
                                      html: { type: 'string', nullable: true },
                                      page_type: {
                                        type: 'string',
                                        enum: ['Documentation', 'Reference'],
                                        nullable: true,
                                      },
                                      side: { type: 'string', enum: ['left', 'right'], nullable: true },
                                      media_type: { type: 'string', enum: ['html', 'image', 'code'], nullable: true },
                                      media_html: { type: 'string', nullable: true },
                                      media_image: { type: 'string', nullable: true },
                                      media_code: { type: 'string', nullable: true },
                                      group0: {
                                        type: 'object',
                                        properties: {
                                          title: { type: 'string', nullable: true },
                                          text: { type: 'string', nullable: true },
                                        },
                                        required: ['title', 'text'],
                                        additionalProperties: false,
                                        nullable: true,
                                      },
                                      group1: {
                                        type: 'object',
                                        properties: {
                                          title: { type: 'string', nullable: true },
                                          text: { type: 'string', nullable: true },
                                        },
                                        required: ['title', 'text'],
                                        additionalProperties: false,
                                        nullable: true,
                                      },
                                      group2: {
                                        type: 'object',
                                        properties: {
                                          title: { type: 'string', nullable: true },
                                          text: { type: 'string', nullable: true },
                                        },
                                        required: ['title', 'text'],
                                        additionalProperties: false,
                                        nullable: true,
                                      },
                                    },
                                    required: [
                                      'type',
                                      'alignment',
                                      'title',
                                      'text',
                                      'html',
                                      'page_type',
                                      'side',
                                      'media_type',
                                      'media_html',
                                      'media_image',
                                      'media_code',
                                      'group0',
                                      'group1',
                                      'group2',
                                    ],
                                    additionalProperties: false,
                                  },
                                  description: 'Landing page content.',
                                },
                              },
                              required: ['promo', 'sections'],
                              additionalProperties: false,
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
                            'layout',
                            'logo',
                            'markdown',
                            'typography',
                            'navigation',
                            'ai',
                            'landing_page',
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
                            jwt_expiration_time: { type: 'number' },
                            login_url: { type: 'string', nullable: true },
                            logout_url: { type: 'string', nullable: true },
                          },
                          required: ['jwt_secret', 'jwt_expiration_time', 'login_url', 'logout_url'],
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
                        i18n: {
                          type: 'object',
                          properties: {
                            defaultLanguage: {
                              type: 'string',
                              enum: ['en', 'de', 'es', 'fr', 'it', 'ja', 'ko', 'nl', 'pt', 'zh'],
                              description: 'The primary language used for this project.',
                            },
                            languages: {
                              type: 'array',
                              items: {
                                type: 'string',
                                enum: ['en', 'de', 'es', 'fr', 'it', 'ja', 'ko', 'nl', 'pt', 'zh'],
                              },
                              description: 'The list of languages this project supports.',
                            },
                            state: {
                              type: 'string',
                              enum: ['disabled', 'enabled'],
                              description: 'If internationalization support is enabled or disabled.',
                            },
                          },
                          required: ['defaultLanguage', 'languages', 'state'],
                          additionalProperties: false,
                          description: 'Internationalization settings for the project.',
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
                            postman: {
                              type: 'object',
                              properties: {
                                key: { type: 'string', nullable: true },
                                client_id: { type: 'string', nullable: true },
                                client_secret: { type: 'string', nullable: true },
                                is_connected: { type: 'boolean' },
                              },
                              required: ['key', 'client_id', 'client_secret', 'is_connected'],
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
                            speakeasy: {
                              type: 'object',
                              properties: {
                                key: { type: 'string', nullable: true, description: 'The API key for Speakeasy.' },
                                spec_url: {
                                  type: 'string',
                                  nullable: true,
                                  description: 'The URL to the Speakeasy spec file.',
                                },
                              },
                              required: ['key', 'spec_url'],
                              additionalProperties: false,
                            },
                            stainless: {
                              type: 'object',
                              properties: {
                                key: { type: 'string', nullable: true, description: 'The API key for Stainless.' },
                                name: {
                                  type: 'string',
                                  nullable: true,
                                  description: 'The name of the Stainless project.',
                                },
                              },
                              required: ['key', 'name'],
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
                            'postman',
                            'koala',
                            'localize',
                            'recaptcha',
                            'segment',
                            'speakeasy',
                            'stainless',
                            'typekit',
                            'zendesk',
                          ],
                          additionalProperties: false,
                        },
                        mcp: {
                          type: 'object',
                          properties: {
                            state: {
                              type: 'string',
                              enum: ['enabled', 'disabled'],
                              default: 'disabled',
                              description: "The availability of the project's MCP server.",
                            },
                            custom_tools: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  title: { type: 'string', description: 'The title of the tool.' },
                                  description: { type: 'string', description: 'The description of the tool.' },
                                  body: { type: 'string', description: 'The body of the tool.' },
                                },
                                required: ['title', 'description', 'body'],
                                additionalProperties: false,
                              },
                              default: [],
                              description: 'Custom tools that the user can add to the MCP server.',
                            },
                            disabled_routes: {
                              type: 'array',
                              items: { type: 'string' },
                              default: [],
                              description: 'Array of route paths that are disabled in the MCP server.',
                            },
                            disabled_tools: {
                              type: 'array',
                              items: { type: 'string' },
                              default: [],
                              description:
                                'Array of tool names that will be prevented from being added to the MCP server.',
                            },
                            has_password: {
                              type: 'boolean',
                              default: false,
                              description: 'Whether the MCP server has a password set. Read-only.',
                            },
                            privacy: {
                              type: 'object',
                              properties: {
                                password: {
                                  type: 'string',
                                  nullable: true,
                                  default: null,
                                  description:
                                    'Set a password for MCP server access. When set, users must provide this password or an API key to access the MCP server. This field can be set, but it will not be returned by the API.',
                                },
                              },
                              additionalProperties: false,
                              default: { password: null },
                              description: 'Privacy settings for the MCP server.',
                            },
                          },
                          additionalProperties: false,
                          description: "Configuration for the project's Model Context Protocol (MCP) server.",
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
                            ai_ready: { type: 'boolean', default: false },
                          },
                          additionalProperties: false,
                        },
                        pages: {
                          type: 'object',
                          properties: {
                            not_found: {
                              type: 'string',
                              pattern:
                                '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/custom_pages\\/([a-f\\d]{24}|([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                              nullable: true,
                              description:
                                'The page you wish to be served to your users when they encounter a 404. This can either map to the `uri` of a Custom Page on your project or be set to `null`. If `null` then the default ReadMe 404 page will be served. The version within the `uri` must be mapped to your stable version.',
                            },
                            default_visibility: {
                              type: 'string',
                              enum: ['public', 'anyone_with_link'],
                              default: 'public',
                              description: 'The default visibility for pages when they are initially created.',
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
                        owner: {
                          type: 'object',
                          properties: {
                            id: {
                              type: 'string',
                              nullable: true,
                              description: 'The unique identifier of the project owner.',
                            },
                            email: {
                              type: 'string',
                              nullable: true,
                              description: 'The email of the project owner. Only visible to god-mode users.',
                            },
                            name: {
                              type: 'string',
                              nullable: true,
                              description: 'The name of the project owner. Only visible to god-mode users.',
                            },
                          },
                          required: ['id', 'email', 'name'],
                          additionalProperties: false,
                          description: 'Information about the project owner.',
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
                                'freelaunch2026',
                                'opensource',
                                'pro2026',
                                'pro2026-annual',
                                'startup',
                                'startup2018',
                                'startup-annual-2024',
                              ],
                              default: 'free',
                            },
                            override: {
                              type: 'string',
                              nullable: true,
                              default: null,
                              description: 'The plan override for the project. Only visible to god-mode users.',
                            },
                            grace_period: {
                              type: 'object',
                              properties: {
                                enabled: { type: 'boolean', default: false },
                                end_date: { type: 'string', format: 'date-time', nullable: true, default: null },
                              },
                              additionalProperties: false,
                            },
                            stripe_subscription_id: {
                              type: 'string',
                              nullable: true,
                              default: null,
                              description:
                                'The Stripe subscription ID for the project. Only visible to god-mode users.',
                            },
                            trial: {
                              type: 'object',
                              properties: {
                                active: {
                                  type: 'boolean',
                                  default: false,
                                  description: 'Whether the project is currently in an active trial.',
                                },
                                enabled: {
                                  type: 'boolean',
                                  nullable: true,
                                  default: null,
                                  description: 'Whether the trial deadline is enabled. Only visible to god-mode users.',
                                },
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
                        metrics: {
                          type: 'object',
                          properties: {
                            monthly_purchase_limit: {
                              type: 'number',
                              default: 0,
                              description: 'The monthly purchase limit for the Developer Dashboard add-on.',
                            },
                            monthly_limit: {
                              type: 'number',
                              default: 0,
                              description: 'The monthly limit for the API Logs.',
                            },
                          },
                          additionalProperties: false,
                        },
                        privacy: {
                          type: 'object',
                          properties: {
                            openapi: {
                              type: 'string',
                              enum: ['public', 'admin'],
                              default: 'admin',
                              description: "The visibility your OpenAPI definitions on your project's `/openapi` page.",
                            },
                            password: {
                              type: 'string',
                              nullable: true,
                              description:
                                "The project's password for when `privacy.view` is `password`. This field can be set, but it will not be returned by the API.",
                            },
                            view: {
                              type: 'string',
                              enum: ['public', 'admin', 'password', 'custom_login'],
                              default: 'public',
                              description:
                                '* `public` - Site is available to the public.\n* `admin` - Site is only available to users that have project permissions.\n* `password` - Site is gated behind a password authentication system.\n* `custom_login` - Users who view your site will be forwarded to a URL of your choice, having them login there and be forwarded back to your ReadMe site.',
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
                            experimental_performance_mode: {
                              type: 'string',
                              enum: ['enabled', 'disabled'],
                              default: 'disabled',
                              description:
                                'Should the experimental performance mode be enabled? This will reduce the size of API definitions that we used within API Reference pages and should overall improve page load times. Please note that this feature is still very experimental and will be eventually enabled for all customers.',
                            },
                            sdk_snippets: {
                              type: 'object',
                              properties: {
                                external: {
                                  type: 'string',
                                  enum: ['active', 'disabled', 'enabled'],
                                  default: 'disabled',
                                  description: 'State of external SDK snippets feature.',
                                },
                              },
                              additionalProperties: false,
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
                            method_badge_style: {
                              type: 'string',
                              enum: ['classic', 'modern'],
                              default: 'classic',
                              description: 'The style of the HTTP method badges used in the API Reference.',
                            },
                            request_examples: {
                              type: 'string',
                              enum: ['expanded', 'collapsed'],
                              default: 'collapsed',
                              description:
                                'When `expanded`, the first available request example auto-populates the request form.',
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
                            show_method_in_sidebar: {
                              type: 'string',
                              enum: ['enabled', 'disabled'],
                              default: 'enabled',
                              description: 'When `enabled`, the HTTP method badge will be shown in the sidebar.',
                            },
                          },
                          required: ['sdk_snippets'],
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
                        llms_txt: {
                          type: 'string',
                          enum: ['enabled', 'disabled'],
                          default: 'enabled',
                          description:
                            'Expose an `llms.txt` file to help AI assistants understand your documentation structure.',
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
                        created_at: {
                          type: 'string',
                          format: 'date-time',
                          nullable: true,
                          description: 'The date the project was created.',
                        },
                        updated_at: {
                          type: 'string',
                          format: 'date-time',
                          nullable: true,
                          description: 'The date the project was last updated.',
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
                        feature_rules: {
                          type: 'object',
                          properties: {
                            merge: {
                              type: 'object',
                              properties: {
                                requirements: {
                                  type: 'array',
                                  items: { type: 'string', enum: ['approval', 'lint'] },
                                  default: [],
                                  description: 'Any states that will block the ability to merge a branch.',
                                },
                                allow_override: {
                                  type: 'array',
                                  items: { type: 'string', enum: ['editor'] },
                                  default: [],
                                  description:
                                    'All permission levels lower than Admin that are able to override a merge that is blocked. Admins can always override.',
                                },
                              },
                              additionalProperties: false,
                            },
                          },
                          required: ['merge'],
                          additionalProperties: false,
                        },
                        git: {
                          type: 'object',
                          properties: {
                            repository_name: {
                              type: 'string',
                              nullable: true,
                              default: null,
                              description: 'The internal Git repository name.',
                            },
                            connection: {
                              type: 'object',
                              properties: {
                                repository: {
                                  type: 'object',
                                  properties: {
                                    provider_type: {
                                      type: 'string',
                                      enum: ['github', 'github_enterprise_server', 'bitbucket', 'gitlab'],
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
                                    privacy: {
                                      type: 'object',
                                      properties: {
                                        private: { type: 'boolean' },
                                        visibility: {
                                          type: 'string',
                                          enum: ['public', 'private', 'internal'],
                                          description: 'Whether this repo is private, public, or internal.',
                                        },
                                      },
                                      required: ['private', 'visibility'],
                                      additionalProperties: false,
                                    },
                                    url: {
                                      type: 'string',
                                      format: 'uri',
                                      description:
                                        'The URL of the repository (e.g., `https://github.com/owner-org/repo-with-content`).',
                                    },
                                  },
                                  required: ['provider_type', 'name', 'full_name', 'privacy', 'url'],
                                  additionalProperties: false,
                                  nullable: true,
                                },
                                organization: {
                                  type: 'object',
                                  properties: {
                                    name: {
                                      type: 'string',
                                      description:
                                        'The name of the organization the linked repository is a part of (e.g., `owner-org`).',
                                    },
                                    provider_type: {
                                      type: 'string',
                                      enum: ['github', 'github_enterprise_server', 'bitbucket', 'gitlab'],
                                      description: 'The type of provider for the organization.',
                                    },
                                  },
                                  required: ['name', 'provider_type'],
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
                              required: ['repository', 'organization'],
                              additionalProperties: false,
                            },
                            remediation_status: {
                              type: 'string',
                              enum: ['pending', 'running', 'completed', 'failed'],
                              nullable: true,
                              description: 'Current remediation job status for this project.',
                            },
                            remediated_at: {
                              type: 'string',
                              format: 'date-time',
                              nullable: true,
                              default: null,
                              description: 'ISO timestamp of the last completed remediation run.',
                            },
                            remediation_initiated_by: {
                              type: 'string',
                              nullable: true,
                              default: null,
                              description: 'Email of the user who initiated the last remediation.',
                            },
                            remediation_dry_run: {
                              type: 'boolean',
                              nullable: true,
                              default: null,
                              description: 'Whether the last remediation was a dry run.',
                            },
                            remediation_job_id: {
                              type: 'string',
                              nullable: true,
                              default: null,
                              description: 'BullMQ root job ID of the most recent remediation run.',
                            },
                          },
                          required: ['connection', 'remediation_status'],
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
                            branches: {
                              type: 'object',
                              properties: {
                                merge: {
                                  type: 'object',
                                  properties: {
                                    admin: { type: 'boolean', description: 'Whether admin role can perform merges.' },
                                    editor: { type: 'boolean', description: 'Whether editor role can perform merges.' },
                                  },
                                  required: ['admin', 'editor'],
                                  additionalProperties: false,
                                  description: 'Role-based access control for merging branches',
                                },
                                approve: {
                                  type: 'object',
                                  properties: {
                                    admin: { type: 'boolean', description: 'Whether admin role can approve changes.' },
                                    editor: { type: 'boolean', description: 'Whether editor role can approve changes' },
                                  },
                                  required: ['admin', 'editor'],
                                  additionalProperties: false,
                                  description: 'Role-based access control for approving changes',
                                },
                              },
                              required: ['merge', 'approve'],
                              additionalProperties: false,
                            },
                          },
                          required: ['appearance', 'branches'],
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
                        notification_settings: {
                          type: 'object',
                          properties: {
                            project_topic_key: {
                              type: 'string',
                              nullable: true,
                              default: null,
                              description:
                                'The Novu Topic Key associated with this project for managing notification subscriptions.',
                            },
                          },
                          additionalProperties: false,
                          description: 'Notification settings for the project.',
                        },
                        uri: {
                          type: 'string',
                          pattern: '\\/projects\\/(me|[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*)',
                          description: 'A URI to the project resource.',
                        },
                      },
                      required: [
                        'ai',
                        'api_designer',
                        'appearance',
                        'canonical_url',
                        'custom_login',
                        'default_version',
                        'description',
                        'health_check',
                        'homepage_url',
                        'i18n',
                        'integrations',
                        'mcp',
                        'name',
                        'onboarding_completed',
                        'pages',
                        'parent',
                        'owner',
                        'plan',
                        'metrics',
                        'privacy',
                        'redirects',
                        'reference',
                        'seo',
                        'subdomain',
                        'id',
                        'created_at',
                        'updated_at',
                        'features',
                        'feature_rules',
                        'git',
                        'permissions',
                        'refactored',
                        'notification_settings',
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
          '409': { description: 'Conflict', content: { 'application/json': { schema: {} } } },
        },
      },
    },
    '/branches/{branch}/reference': {
      post: {
        operationId: 'createReference',
        summary: 'Create a reference page',
        tags: ['API Reference'],
        description:
          'Create a page in the API Reference section of your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).',
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
                  appearance: {
                    type: 'object',
                    properties: {
                      icon: {
                        type: 'object',
                        properties: {
                          name: { type: 'string', nullable: true },
                          type: { type: 'string', enum: ['icon', 'emoji'], nullable: true },
                        },
                        additionalProperties: false,
                      },
                    },
                    additionalProperties: false,
                  },
                  category: {
                    type: 'object',
                    properties: {
                      uri: {
                        type: 'string',
                        pattern:
                          '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/categories\\/(guides|reference)\\/((.*))',
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
                                    type: { type: 'string', enum: ['basic', 'endpoint', 'changelog', 'custom_page'] },
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
                  metadata: {
                    type: 'object',
                    properties: {
                      description: { type: 'string', nullable: true },
                      keywords: { type: 'string', nullable: true },
                      title: { type: 'string', nullable: true },
                      x_import: { type: 'string', nullable: true },
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
                          '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/(guides|reference)\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                        nullable: true,
                      },
                    },
                    additionalProperties: false,
                  },
                  privacy: {
                    type: 'object',
                    properties: {
                      view: {
                        type: 'string',
                        enum: ['public', 'anyone_with_link'],
                        default: 'public',
                        description: 'The visibility of this page.',
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
                                '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/recipes\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                              description:
                                'URI of the recipe that this API reference is connected to. The recipe and API reference must exist within the same version.',
                            },
                            title: { type: 'string', description: 'The title of the connected recipe.' },
                            slug: { type: 'string', description: 'The slug of the connected recipe.' },
                            appearance: {
                              type: 'object',
                              properties: {
                                background_color: {
                                  type: 'string',
                                  description: 'The background color of the recipe tile.',
                                },
                                emoji: { type: 'string', nullable: true },
                              },
                              additionalProperties: false,
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
                            default: true,
                            description:
                              'This API operation uses `additionalProperties` for handling extra schema properties.',
                          },
                          callbacks: {
                            type: 'boolean',
                            default: true,
                            description: 'This API operation has `callbacks` documented.',
                          },
                          circular_references: {
                            type: 'boolean',
                            default: true,
                            description: 'This API operation contains `$ref` schema pointers that resolve to itself.',
                          },
                          common_parameters: {
                            type: 'boolean',
                            default: true,
                            description: 'This API operation utilizes common parameters set at the path level.',
                          },
                          discriminators: {
                            type: 'boolean',
                            default: true,
                            description:
                              'This API operation utilizes `discriminator` for discriminating between different parts in a polymorphic schema.',
                          },
                          links: {
                            type: 'boolean',
                            default: true,
                            description: 'This API operation has `links` documented.',
                          },
                          polymorphism: {
                            type: 'boolean',
                            default: true,
                            description: 'This API operation contains polymorphic schemas.',
                          },
                          references: {
                            type: 'boolean',
                            default: true,
                            description:
                              'This API operation, after being dereferenced, has `x-readme-ref-name` entries defining what the original `$ref` schema pointers were named.',
                          },
                          server_variables: {
                            type: 'boolean',
                            default: true,
                            description:
                              'This API operation has composable variables configured for its server definition.',
                          },
                          style: {
                            type: 'boolean',
                            default: true,
                            description: 'This API operation has parameters that have specific `style` serializations.',
                          },
                          webhooks: {
                            type: 'boolean',
                            default: true,
                            description: 'This API definition has `webhooks` documented.',
                          },
                          xml_requests: {
                            type: 'boolean',
                            default: true,
                            description: 'This API operation has request bodies that accept XML.',
                          },
                          xml_responses: {
                            type: 'boolean',
                            default: true,
                            description: 'This API operation has response payloads that return XML.',
                          },
                          xml_schemas: {
                            type: 'boolean',
                            default: true,
                            description: 'This API operation has parameters or schemas that can serialize to XML.',
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
                          '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/apis\\/((([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+.(json|yaml|yml)))',
                        nullable: true,
                      },
                      validation: {
                        type: 'object',
                        properties: {
                          status: {
                            type: 'string',
                            enum: ['pending', 'valid', 'valid-with-warnings', 'invalid'],
                            description: 'Whether the API definition is valid or not.',
                          },
                          reason: { type: 'string', nullable: true },
                        },
                        additionalProperties: false,
                        description: 'The validation state of the API definition.',
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
            schema: {
              type: 'string',
              pattern: '(v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?',
            },
            in: 'path',
            name: 'branch',
            required: true,
            description: "Project version number, `stable` for your project's stable version, or a valid branch name.",
          },
          {
            schema: { type: 'string' },
            in: 'header',
            name: 'prefer',
            required: false,
            description:
              'By default, the supplied `slug` will be made unique during reference creation if it already exists, however if you do not want this behavior you can supply `prefer: handling=strict` to receive a 409 Conflict instead.',
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
                        appearance: {
                          type: 'object',
                          properties: {
                            icon: {
                              type: 'object',
                              properties: {
                                name: { type: 'string', nullable: true },
                                type: { type: 'string', enum: ['icon', 'emoji'], nullable: true },
                              },
                              required: ['name', 'type'],
                              additionalProperties: false,
                            },
                          },
                          required: ['icon'],
                          additionalProperties: false,
                        },
                        category: {
                          type: 'object',
                          properties: {
                            uri: {
                              type: 'string',
                              pattern:
                                '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/categories\\/(guides|reference)\\/((.*))',
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
                                          type: {
                                            type: 'string',
                                            enum: ['basic', 'endpoint', 'changelog', 'custom_page'],
                                          },
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
                            x_import: {
                              type: 'string',
                              nullable: true,
                              description:
                                'A URI to the external docs page that this page is being imported from. Set while a page is mid-import and removed once the import completes; its presence signals that the page is read-only and still hydrating.',
                            },
                          },
                          required: ['description', 'image', 'keywords', 'title', 'x_import'],
                          additionalProperties: false,
                        },
                        parent: {
                          type: 'object',
                          properties: {
                            uri: {
                              type: 'string',
                              pattern:
                                '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/(guides|reference)\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
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
                            view: {
                              type: 'string',
                              enum: ['public', 'anyone_with_link'],
                              default: 'public',
                              description: 'The visibility of this page.',
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
                              type: 'string',
                              nullable: true,
                              description:
                                'The API schema for this reference endpoint. This schema may be a reduced (i.e., only contains the necessary information for this endpoint) and/or dereferenced version of the full API definition, depending upon the query parameters used for this request.',
                            },
                            stats: {
                              type: 'object',
                              properties: {
                                additional_properties: {
                                  type: 'boolean',
                                  default: true,
                                  description:
                                    'This API operation uses `additionalProperties` for handling extra schema properties.',
                                },
                                callbacks: {
                                  type: 'boolean',
                                  default: true,
                                  description: 'This API operation has `callbacks` documented.',
                                },
                                circular_references: {
                                  type: 'boolean',
                                  default: true,
                                  description:
                                    'This API operation contains `$ref` schema pointers that resolve to itself.',
                                },
                                common_parameters: {
                                  type: 'boolean',
                                  default: true,
                                  description: 'This API operation utilizes common parameters set at the path level.',
                                },
                                discriminators: {
                                  type: 'boolean',
                                  default: true,
                                  description:
                                    'This API operation utilizes `discriminator` for discriminating between different parts in a polymorphic schema.',
                                },
                                links: {
                                  type: 'boolean',
                                  default: true,
                                  description: 'This API operation has `links` documented.',
                                },
                                polymorphism: {
                                  type: 'boolean',
                                  default: true,
                                  description: 'This API operation contains polymorphic schemas.',
                                },
                                references: {
                                  type: 'boolean',
                                  default: true,
                                  description:
                                    'This API operation, after being dereferenced, has `x-readme-ref-name` entries defining what the original `$ref` schema pointers were named.',
                                },
                                server_variables: {
                                  type: 'boolean',
                                  default: true,
                                  description:
                                    'This API operation has composable variables configured for its server definition.',
                                },
                                style: {
                                  type: 'boolean',
                                  default: true,
                                  description:
                                    'This API operation has parameters that have specific `style` serializations.',
                                },
                                webhooks: {
                                  type: 'boolean',
                                  default: true,
                                  description: 'This API definition has `webhooks` documented.',
                                },
                                xml_requests: {
                                  type: 'boolean',
                                  default: true,
                                  description: 'This API operation has request bodies that accept XML.',
                                },
                                xml_responses: {
                                  type: 'boolean',
                                  default: true,
                                  description: 'This API operation has response payloads that return XML.',
                                },
                                xml_schemas: {
                                  type: 'boolean',
                                  default: true,
                                  description:
                                    'This API operation has parameters or schemas that can serialize to XML.',
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
                              description: 'The source by which this API definition was ingested.',
                            },
                            uri: {
                              type: 'string',
                              pattern:
                                '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/apis\\/((([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+.(json|yaml|yml)))',
                              nullable: true,
                              description: 'A URI to the API resource.',
                            },
                            validation: {
                              type: 'object',
                              properties: {
                                status: {
                                  type: 'string',
                                  enum: ['pending', 'valid', 'valid-with-warnings', 'invalid'],
                                  description: 'Whether the API definition is valid or not.',
                                },
                                reason: {
                                  type: 'string',
                                  nullable: true,
                                  description:
                                    'The reason(s) for for the APIs validation state. If the API is valid then this may contain any fixable warnings.',
                                },
                              },
                              required: ['status', 'reason'],
                              additionalProperties: false,
                              description: 'The validation state of the API definition.',
                            },
                          },
                          required: ['method', 'path', 'stats', 'source', 'uri', 'validation'],
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
                                      '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/recipes\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                                    description:
                                      'URI of the recipe that this API reference is connected to. The recipe and API reference must exist within the same version.',
                                  },
                                  title: { type: 'string', description: 'The title of the connected recipe.' },
                                  slug: { type: 'string', description: 'The slug of the connected recipe.' },
                                  appearance: {
                                    type: 'object',
                                    properties: {
                                      background_color: {
                                        type: 'string',
                                        description: 'The background color of the recipe tile.',
                                      },
                                      emoji: {
                                        type: 'string',
                                        nullable: true,
                                        description: 'The emoji icon for the recipe tile.',
                                      },
                                    },
                                    required: ['background_color', 'emoji'],
                                    additionalProperties: false,
                                  },
                                },
                                required: ['uri', 'title', 'slug', 'appearance'],
                                additionalProperties: false,
                              },
                              nullable: true,
                              description: 'A collection of recipes that are displayed on this API reference.',
                            },
                          },
                          required: ['recipes'],
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
                            github_url: {
                              type: 'string',
                              nullable: true,
                              description: 'link to the github of this page',
                            },
                          },
                          required: ['dash', 'hub', 'github_url'],
                          additionalProperties: false,
                        },
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
                              description: 'A flag for if the resource is renderable or not.',
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
                        updated_at: {
                          type: 'string',
                          format: 'date-time',
                          description: 'An ISO 8601 formatted date for when the page was updated.',
                        },
                        uri: {
                          type: 'string',
                          pattern:
                            '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/(guides|reference)\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                          description: 'A URI to the page resource.',
                        },
                      },
                      required: [
                        'appearance',
                        'category',
                        'content',
                        'metadata',
                        'parent',
                        'privacy',
                        'slug',
                        'title',
                        'api_config',
                        'api',
                        'connections',
                        'href',
                        'links',
                        'project',
                        'renderable',
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
    '/branches/{branch}/reference/{slug}': {
      delete: {
        operationId: 'deleteReference',
        summary: 'Delete a reference page',
        tags: ['API Reference'],
        description:
          'Delete a page from the API Reference section of your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).',
        parameters: [
          {
            schema: { type: 'boolean', default: false },
            in: 'query',
            name: 'cleanup_definition',
            required: false,
            description:
              'For a reference page that is documenting an endpoint and has an underlying API definition file, setting this parameter to `true` will remove the endpoint from the underlying API definition if that page is the only one rendering out that endpoint.',
          },
          {
            schema: {
              type: 'string',
              pattern: '(v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?',
            },
            in: 'path',
            name: 'branch',
            required: true,
            description: "Project version number, `stable` for your project's stable version, or a valid branch name.",
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
          'Updates an existing page in the API Reference section of your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).',
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
                  appearance: {
                    type: 'object',
                    properties: {
                      icon: {
                        type: 'object',
                        properties: {
                          name: { type: 'string', nullable: true },
                          type: { type: 'string', enum: ['icon', 'emoji'], nullable: true },
                        },
                        additionalProperties: false,
                      },
                    },
                    additionalProperties: false,
                  },
                  category: {
                    type: 'object',
                    properties: {
                      uri: {
                        type: 'string',
                        pattern:
                          '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/categories\\/(guides|reference)\\/((.*))',
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
                                    type: { type: 'string', enum: ['basic', 'endpoint', 'changelog', 'custom_page'] },
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
                  metadata: {
                    type: 'object',
                    properties: {
                      description: { type: 'string', nullable: true },
                      keywords: { type: 'string', nullable: true },
                      title: { type: 'string', nullable: true },
                      x_import: { type: 'string', nullable: true },
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
                          '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/(guides|reference)\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                        nullable: true,
                      },
                    },
                    additionalProperties: false,
                  },
                  privacy: {
                    type: 'object',
                    properties: {
                      view: {
                        type: 'string',
                        enum: ['public', 'anyone_with_link'],
                        default: 'public',
                        description: 'The visibility of this page.',
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
                                '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/recipes\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                              description:
                                'URI of the recipe that this API reference is connected to. The recipe and API reference must exist within the same version.',
                            },
                            title: { type: 'string', description: 'The title of the connected recipe.' },
                            slug: { type: 'string', description: 'The slug of the connected recipe.' },
                            appearance: {
                              type: 'object',
                              properties: {
                                background_color: {
                                  type: 'string',
                                  description: 'The background color of the recipe tile.',
                                },
                                emoji: { type: 'string', nullable: true },
                              },
                              additionalProperties: false,
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
                      schema: { type: 'string', nullable: true },
                      stats: {
                        type: 'object',
                        properties: {
                          additional_properties: {
                            type: 'boolean',
                            default: true,
                            description:
                              'This API operation uses `additionalProperties` for handling extra schema properties.',
                          },
                          callbacks: {
                            type: 'boolean',
                            default: true,
                            description: 'This API operation has `callbacks` documented.',
                          },
                          circular_references: {
                            type: 'boolean',
                            default: true,
                            description: 'This API operation contains `$ref` schema pointers that resolve to itself.',
                          },
                          common_parameters: {
                            type: 'boolean',
                            default: true,
                            description: 'This API operation utilizes common parameters set at the path level.',
                          },
                          discriminators: {
                            type: 'boolean',
                            default: true,
                            description:
                              'This API operation utilizes `discriminator` for discriminating between different parts in a polymorphic schema.',
                          },
                          links: {
                            type: 'boolean',
                            default: true,
                            description: 'This API operation has `links` documented.',
                          },
                          polymorphism: {
                            type: 'boolean',
                            default: true,
                            description: 'This API operation contains polymorphic schemas.',
                          },
                          references: {
                            type: 'boolean',
                            default: true,
                            description:
                              'This API operation, after being dereferenced, has `x-readme-ref-name` entries defining what the original `$ref` schema pointers were named.',
                          },
                          server_variables: {
                            type: 'boolean',
                            default: true,
                            description:
                              'This API operation has composable variables configured for its server definition.',
                          },
                          style: {
                            type: 'boolean',
                            default: true,
                            description: 'This API operation has parameters that have specific `style` serializations.',
                          },
                          webhooks: {
                            type: 'boolean',
                            default: true,
                            description: 'This API definition has `webhooks` documented.',
                          },
                          xml_requests: {
                            type: 'boolean',
                            default: true,
                            description: 'This API operation has request bodies that accept XML.',
                          },
                          xml_responses: {
                            type: 'boolean',
                            default: true,
                            description: 'This API operation has response payloads that return XML.',
                          },
                          xml_schemas: {
                            type: 'boolean',
                            default: true,
                            description: 'This API operation has parameters or schemas that can serialize to XML.',
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
                          '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/apis\\/((([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+.(json|yaml|yml)))',
                        nullable: true,
                      },
                      validation: {
                        type: 'object',
                        properties: {
                          status: {
                            type: 'string',
                            enum: ['pending', 'valid', 'valid-with-warnings', 'invalid'],
                            description: 'Whether the API definition is valid or not.',
                          },
                          reason: { type: 'string', nullable: true },
                        },
                        additionalProperties: false,
                        description: 'The validation state of the API definition.',
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
            schema: {
              type: 'string',
              pattern: '(v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?',
            },
            in: 'path',
            name: 'branch',
            required: true,
            description: "Project version number, `stable` for your project's stable version, or a valid branch name.",
          },
          {
            schema: { type: 'string', pattern: '([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+' },
            in: 'path',
            name: 'slug',
            required: true,
            description: 'A URL-safe representation of the resource.',
          },
          {
            schema: { type: 'string' },
            in: 'header',
            name: 'prefer',
            required: false,
            description:
              'By default, the supplied `slug` will be made unique during reference updates if it already exists, however if you do not want this behavior you can supply `prefer: handling=strict` to receive a 409 Conflict instead.',
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
                        appearance: {
                          type: 'object',
                          properties: {
                            icon: {
                              type: 'object',
                              properties: {
                                name: { type: 'string', nullable: true },
                                type: { type: 'string', enum: ['icon', 'emoji'], nullable: true },
                              },
                              required: ['name', 'type'],
                              additionalProperties: false,
                            },
                          },
                          required: ['icon'],
                          additionalProperties: false,
                        },
                        category: {
                          type: 'object',
                          properties: {
                            uri: {
                              type: 'string',
                              pattern:
                                '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/categories\\/(guides|reference)\\/((.*))',
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
                                          type: {
                                            type: 'string',
                                            enum: ['basic', 'endpoint', 'changelog', 'custom_page'],
                                          },
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
                            x_import: {
                              type: 'string',
                              nullable: true,
                              description:
                                'A URI to the external docs page that this page is being imported from. Set while a page is mid-import and removed once the import completes; its presence signals that the page is read-only and still hydrating.',
                            },
                          },
                          required: ['description', 'image', 'keywords', 'title', 'x_import'],
                          additionalProperties: false,
                        },
                        parent: {
                          type: 'object',
                          properties: {
                            uri: {
                              type: 'string',
                              pattern:
                                '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/(guides|reference)\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
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
                            view: {
                              type: 'string',
                              enum: ['public', 'anyone_with_link'],
                              default: 'public',
                              description: 'The visibility of this page.',
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
                                  default: true,
                                  description:
                                    'This API operation uses `additionalProperties` for handling extra schema properties.',
                                },
                                callbacks: {
                                  type: 'boolean',
                                  default: true,
                                  description: 'This API operation has `callbacks` documented.',
                                },
                                circular_references: {
                                  type: 'boolean',
                                  default: true,
                                  description:
                                    'This API operation contains `$ref` schema pointers that resolve to itself.',
                                },
                                common_parameters: {
                                  type: 'boolean',
                                  default: true,
                                  description: 'This API operation utilizes common parameters set at the path level.',
                                },
                                discriminators: {
                                  type: 'boolean',
                                  default: true,
                                  description:
                                    'This API operation utilizes `discriminator` for discriminating between different parts in a polymorphic schema.',
                                },
                                links: {
                                  type: 'boolean',
                                  default: true,
                                  description: 'This API operation has `links` documented.',
                                },
                                polymorphism: {
                                  type: 'boolean',
                                  default: true,
                                  description: 'This API operation contains polymorphic schemas.',
                                },
                                references: {
                                  type: 'boolean',
                                  default: true,
                                  description:
                                    'This API operation, after being dereferenced, has `x-readme-ref-name` entries defining what the original `$ref` schema pointers were named.',
                                },
                                server_variables: {
                                  type: 'boolean',
                                  default: true,
                                  description:
                                    'This API operation has composable variables configured for its server definition.',
                                },
                                style: {
                                  type: 'boolean',
                                  default: true,
                                  description:
                                    'This API operation has parameters that have specific `style` serializations.',
                                },
                                webhooks: {
                                  type: 'boolean',
                                  default: true,
                                  description: 'This API definition has `webhooks` documented.',
                                },
                                xml_requests: {
                                  type: 'boolean',
                                  default: true,
                                  description: 'This API operation has request bodies that accept XML.',
                                },
                                xml_responses: {
                                  type: 'boolean',
                                  default: true,
                                  description: 'This API operation has response payloads that return XML.',
                                },
                                xml_schemas: {
                                  type: 'boolean',
                                  default: true,
                                  description:
                                    'This API operation has parameters or schemas that can serialize to XML.',
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
                              description: 'The source by which this API definition was ingested.',
                            },
                            uri: {
                              type: 'string',
                              pattern:
                                '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/apis\\/((([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+.(json|yaml|yml)))',
                              nullable: true,
                              description: 'A URI to the API resource.',
                            },
                            validation: {
                              type: 'object',
                              properties: {
                                status: {
                                  type: 'string',
                                  enum: ['pending', 'valid', 'valid-with-warnings', 'invalid'],
                                  description: 'Whether the API definition is valid or not.',
                                },
                                reason: {
                                  type: 'string',
                                  nullable: true,
                                  description:
                                    'The reason(s) for for the APIs validation state. If the API is valid then this may contain any fixable warnings.',
                                },
                              },
                              required: ['status', 'reason'],
                              additionalProperties: false,
                              description: 'The validation state of the API definition.',
                            },
                          },
                          required: ['method', 'path', 'stats', 'source', 'uri', 'validation'],
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
                                      '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/recipes\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                                    description:
                                      'URI of the recipe that this API reference is connected to. The recipe and API reference must exist within the same version.',
                                  },
                                  title: { type: 'string', description: 'The title of the connected recipe.' },
                                  slug: { type: 'string', description: 'The slug of the connected recipe.' },
                                  appearance: {
                                    type: 'object',
                                    properties: {
                                      background_color: {
                                        type: 'string',
                                        description: 'The background color of the recipe tile.',
                                      },
                                      emoji: {
                                        type: 'string',
                                        nullable: true,
                                        description: 'The emoji icon for the recipe tile.',
                                      },
                                    },
                                    required: ['background_color', 'emoji'],
                                    additionalProperties: false,
                                  },
                                },
                                required: ['uri', 'title', 'slug', 'appearance'],
                                additionalProperties: false,
                              },
                              nullable: true,
                              description: 'A collection of recipes that are displayed on this API reference.',
                            },
                          },
                          required: ['recipes'],
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
                            github_url: {
                              type: 'string',
                              nullable: true,
                              description: 'link to the github of this page',
                            },
                          },
                          required: ['dash', 'hub', 'github_url'],
                          additionalProperties: false,
                        },
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
                              description: 'A flag for if the resource is renderable or not.',
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
                        updated_at: {
                          type: 'string',
                          format: 'date-time',
                          description: 'An ISO 8601 formatted date for when the page was updated.',
                        },
                        uri: {
                          type: 'string',
                          pattern:
                            '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/(guides|reference)\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                          description: 'A URI to the page resource.',
                        },
                      },
                      required: [
                        'appearance',
                        'category',
                        'content',
                        'metadata',
                        'parent',
                        'privacy',
                        'slug',
                        'title',
                        'api_config',
                        'api',
                        'connections',
                        'href',
                        'links',
                        'project',
                        'renderable',
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
          '204': { description: 'No Content' },
        },
      },
      get: {
        operationId: 'getReference',
        summary: 'Get a reference page',
        tags: ['API Reference'],
        description:
          'Get a page from the API Reference section of your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).',
        parameters: [
          {
            schema: { type: 'string', enum: ['true', 'false'], default: 'true' },
            in: 'query',
            name: 'reduce',
            required: false,
            description:
              'Whether or not to reduce the attached API definition. Defaults to `true` if not specified (subject to change while API v2 is still in beta).',
          },
          {
            schema: {
              type: 'string',
              pattern: '(v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?',
            },
            in: 'path',
            name: 'branch',
            required: true,
            description: "Project version number, `stable` for your project's stable version, or a valid branch name.",
          },
          {
            schema: { type: 'string', pattern: '([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+' },
            in: 'path',
            name: 'slug',
            required: true,
            description: 'A URL-safe representation of the resource.',
          },
          {
            schema: { type: 'string' },
            in: 'header',
            name: 'if-none-match',
            required: false,
            description: 'An ETag value to compare against the resource.',
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
                        appearance: {
                          type: 'object',
                          properties: {
                            icon: {
                              type: 'object',
                              properties: {
                                name: { type: 'string', nullable: true },
                                type: { type: 'string', enum: ['icon', 'emoji'], nullable: true },
                              },
                              required: ['name', 'type'],
                              additionalProperties: false,
                            },
                          },
                          required: ['icon'],
                          additionalProperties: false,
                        },
                        category: {
                          type: 'object',
                          properties: {
                            uri: {
                              type: 'string',
                              pattern:
                                '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/categories\\/(guides|reference)\\/((.*))',
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
                                          type: {
                                            type: 'string',
                                            enum: ['basic', 'endpoint', 'changelog', 'custom_page'],
                                          },
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
                            x_import: {
                              type: 'string',
                              nullable: true,
                              description:
                                'A URI to the external docs page that this page is being imported from. Set while a page is mid-import and removed once the import completes; its presence signals that the page is read-only and still hydrating.',
                            },
                          },
                          required: ['description', 'image', 'keywords', 'title', 'x_import'],
                          additionalProperties: false,
                        },
                        parent: {
                          type: 'object',
                          properties: {
                            uri: {
                              type: 'string',
                              pattern:
                                '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/(guides|reference)\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
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
                            view: {
                              type: 'string',
                              enum: ['public', 'anyone_with_link'],
                              default: 'public',
                              description: 'The visibility of this page.',
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
                              type: 'string',
                              nullable: true,
                              description:
                                'The API schema for this reference endpoint. This schema may be a reduced (i.e., only contains the necessary information for this endpoint) and/or dereferenced version of the full API definition, depending upon the query parameters used for this request.',
                            },
                            stats: {
                              type: 'object',
                              properties: {
                                additional_properties: {
                                  type: 'boolean',
                                  default: true,
                                  description:
                                    'This API operation uses `additionalProperties` for handling extra schema properties.',
                                },
                                callbacks: {
                                  type: 'boolean',
                                  default: true,
                                  description: 'This API operation has `callbacks` documented.',
                                },
                                circular_references: {
                                  type: 'boolean',
                                  default: true,
                                  description:
                                    'This API operation contains `$ref` schema pointers that resolve to itself.',
                                },
                                common_parameters: {
                                  type: 'boolean',
                                  default: true,
                                  description: 'This API operation utilizes common parameters set at the path level.',
                                },
                                discriminators: {
                                  type: 'boolean',
                                  default: true,
                                  description:
                                    'This API operation utilizes `discriminator` for discriminating between different parts in a polymorphic schema.',
                                },
                                links: {
                                  type: 'boolean',
                                  default: true,
                                  description: 'This API operation has `links` documented.',
                                },
                                polymorphism: {
                                  type: 'boolean',
                                  default: true,
                                  description: 'This API operation contains polymorphic schemas.',
                                },
                                references: {
                                  type: 'boolean',
                                  default: true,
                                  description:
                                    'This API operation, after being dereferenced, has `x-readme-ref-name` entries defining what the original `$ref` schema pointers were named.',
                                },
                                server_variables: {
                                  type: 'boolean',
                                  default: true,
                                  description:
                                    'This API operation has composable variables configured for its server definition.',
                                },
                                style: {
                                  type: 'boolean',
                                  default: true,
                                  description:
                                    'This API operation has parameters that have specific `style` serializations.',
                                },
                                webhooks: {
                                  type: 'boolean',
                                  default: true,
                                  description: 'This API definition has `webhooks` documented.',
                                },
                                xml_requests: {
                                  type: 'boolean',
                                  default: true,
                                  description: 'This API operation has request bodies that accept XML.',
                                },
                                xml_responses: {
                                  type: 'boolean',
                                  default: true,
                                  description: 'This API operation has response payloads that return XML.',
                                },
                                xml_schemas: {
                                  type: 'boolean',
                                  default: true,
                                  description:
                                    'This API operation has parameters or schemas that can serialize to XML.',
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
                              description: 'The source by which this API definition was ingested.',
                            },
                            uri: {
                              type: 'string',
                              pattern:
                                '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/apis\\/((([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+.(json|yaml|yml)))',
                              nullable: true,
                              description: 'A URI to the API resource.',
                            },
                            validation: {
                              type: 'object',
                              properties: {
                                status: {
                                  type: 'string',
                                  enum: ['pending', 'valid', 'valid-with-warnings', 'invalid'],
                                  description: 'Whether the API definition is valid or not.',
                                },
                                reason: {
                                  type: 'string',
                                  nullable: true,
                                  description:
                                    'The reason(s) for for the APIs validation state. If the API is valid then this may contain any fixable warnings.',
                                },
                              },
                              required: ['status', 'reason'],
                              additionalProperties: false,
                              description: 'The validation state of the API definition.',
                            },
                          },
                          required: ['method', 'path', 'stats', 'source', 'uri', 'validation'],
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
                                      '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/recipes\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                                    description:
                                      'URI of the recipe that this API reference is connected to. The recipe and API reference must exist within the same version.',
                                  },
                                  title: { type: 'string', description: 'The title of the connected recipe.' },
                                  slug: { type: 'string', description: 'The slug of the connected recipe.' },
                                  appearance: {
                                    type: 'object',
                                    properties: {
                                      background_color: {
                                        type: 'string',
                                        description: 'The background color of the recipe tile.',
                                      },
                                      emoji: {
                                        type: 'string',
                                        nullable: true,
                                        description: 'The emoji icon for the recipe tile.',
                                      },
                                    },
                                    required: ['background_color', 'emoji'],
                                    additionalProperties: false,
                                  },
                                },
                                required: ['uri', 'title', 'slug', 'appearance'],
                                additionalProperties: false,
                              },
                              nullable: true,
                              description: 'A collection of recipes that are displayed on this API reference.',
                            },
                          },
                          required: ['recipes'],
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
                            github_url: {
                              type: 'string',
                              nullable: true,
                              description: 'link to the github of this page',
                            },
                          },
                          required: ['dash', 'hub', 'github_url'],
                          additionalProperties: false,
                        },
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
                              description: 'A flag for if the resource is renderable or not.',
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
                        updated_at: {
                          type: 'string',
                          format: 'date-time',
                          description: 'An ISO 8601 formatted date for when the page was updated.',
                        },
                        uri: {
                          type: 'string',
                          pattern:
                            '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/(guides|reference)\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                          description: 'A URI to the page resource.',
                        },
                      },
                      required: [
                        'appearance',
                        'category',
                        'content',
                        'metadata',
                        'parent',
                        'privacy',
                        'slug',
                        'title',
                        'api_config',
                        'api',
                        'connections',
                        'href',
                        'links',
                        'project',
                        'renderable',
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
          '304': { description: 'Not Modified', content: { 'application/json': { schema: {} } } },
        },
      },
    },
    '/branches/{branch}/recipes': {
      get: {
        operationId: 'getRecipes',
        summary: 'Get all recipes',
        tags: ['Recipes'],
        description:
          'Get all recipes from your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).',
        parameters: [
          {
            schema: {
              type: 'string',
              pattern: '(v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?',
            },
            in: 'path',
            name: 'branch',
            required: true,
            description: "Project version number, `stable` for your project's stable version, or a valid branch name.",
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
                              background_color: {
                                type: 'string',
                                pattern: '^(?:#[0-9a-fA-F]{3}|#[0-9a-fA-F]{4}|#[0-9a-fA-F]{6}|#[0-9a-fA-F]{8})$',
                                default: '#000000',
                                description: 'The color of the recipe card.',
                              },
                              emoji: {
                                type: 'string',
                                nullable: true,
                                description: 'The Unicode emoji to be displayed within the recipe card.',
                              },
                            },
                            required: ['emoji'],
                            additionalProperties: false,
                          },
                          connections: {
                            type: 'object',
                            properties: {
                              references: {
                                type: 'array',
                                items: {
                                  type: 'object',
                                  properties: {
                                    uri: {
                                      type: 'string',
                                      pattern:
                                        '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/(guides|reference)\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                                      description:
                                        'URI of the API reference page that this recipe will be connected to. The API reference and recipe must exist within the same version.',
                                    },
                                  },
                                  required: ['uri'],
                                  additionalProperties: false,
                                },
                                nullable: true,
                                description:
                                  'A collection of API reference pages that this recipe will be displayed on.',
                              },
                            },
                            required: ['references'],
                            additionalProperties: false,
                          },
                          content: {
                            type: 'object',
                            properties: {
                              steps: {
                                type: 'array',
                                items: {
                                  type: 'object',
                                  properties: {
                                    title: { type: 'string', description: 'Title of the step.' },
                                    body: { type: 'string', nullable: true, description: 'Content of the step.' },
                                    line_numbers: {
                                      type: 'array',
                                      items: { type: 'string' },
                                      description:
                                        'Line numbers to highlight in the code snippet. (e.g. `["1-5", "10"]).',
                                    },
                                  },
                                  required: ['title', 'body', 'line_numbers'],
                                  additionalProperties: false,
                                },
                              },
                              snippet: {
                                type: 'object',
                                properties: {
                                  code_options: {
                                    type: 'array',
                                    items: {
                                      type: 'object',
                                      properties: {
                                        code: {
                                          type: 'string',
                                          nullable: true,
                                          description: 'Code to display for the specific language.',
                                        },
                                        language: { type: 'string', description: 'Language of the code snippet.' },
                                        name: {
                                          type: 'string',
                                          nullable: true,
                                          description: 'Name of the code snippet.',
                                        },
                                        highlighted_syntax: {
                                          type: 'string',
                                          description: 'Actual syntax highlighter to use on the code snippet.',
                                        },
                                      },
                                      required: ['code', 'language'],
                                      additionalProperties: false,
                                    },
                                    description: 'Array of code snippets to display in the recipe.',
                                  },
                                },
                                required: ['code_options'],
                                additionalProperties: false,
                              },
                              response: {
                                type: 'string',
                                nullable: true,
                                description: 'Example response to display in the recipe.',
                              },
                            },
                            required: ['steps', 'snippet', 'response'],
                            additionalProperties: false,
                          },
                          description: { type: 'string', nullable: true },
                          privacy: {
                            type: 'object',
                            properties: {
                              view: {
                                type: 'string',
                                enum: ['public', 'anyone_with_link'],
                                default: 'public',
                                description: 'Who can view the recipe.',
                              },
                            },
                            additionalProperties: false,
                          },
                          title: { type: 'string' },
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
                          slug: { type: 'string' },
                          uri: {
                            type: 'string',
                            pattern:
                              '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/recipes\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                          },
                        },
                        required: [
                          'appearance',
                          'connections',
                          'content',
                          'description',
                          'privacy',
                          'title',
                          'links',
                          'slug',
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
      post: {
        operationId: 'createRecipe',
        summary: 'Create a recipe',
        tags: ['Recipes'],
        description:
          'Create a new recipe in your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  appearance: {
                    type: 'object',
                    properties: {
                      background_color: {
                        type: 'string',
                        pattern: '^(?:#[0-9a-fA-F]{3}|#[0-9a-fA-F]{4}|#[0-9a-fA-F]{6}|#[0-9a-fA-F]{8})$',
                        default: '#000000',
                        description: 'The color of the recipe card.',
                      },
                      emoji: { type: 'string', nullable: true },
                    },
                    additionalProperties: false,
                  },
                  connections: {
                    type: 'object',
                    properties: {
                      references: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            uri: {
                              type: 'string',
                              pattern:
                                '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/(guides|reference)\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                              description:
                                'URI of the API reference page that this recipe will be connected to. The API reference and recipe must exist within the same version.',
                            },
                          },
                          additionalProperties: false,
                        },
                        nullable: true,
                      },
                    },
                    additionalProperties: false,
                  },
                  content: {
                    type: 'object',
                    properties: {
                      steps: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            title: { type: 'string', description: 'Title of the step.' },
                            body: { type: 'string', nullable: true },
                            line_numbers: {
                              type: 'array',
                              items: { type: 'string' },
                              description: 'Line numbers to highlight in the code snippet. (e.g. `["1-5", "10"]).',
                            },
                          },
                          additionalProperties: false,
                        },
                      },
                      snippet: {
                        type: 'object',
                        properties: {
                          code_options: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                code: { type: 'string', nullable: true },
                                language: { type: 'string', description: 'Language of the code snippet.' },
                                name: { type: 'string', nullable: true },
                                highlighted_syntax: { type: 'string' },
                              },
                              additionalProperties: false,
                            },
                            description: 'Array of code snippets to display in the recipe.',
                          },
                        },
                        additionalProperties: false,
                      },
                      response: { type: 'string', nullable: true },
                    },
                    additionalProperties: false,
                  },
                  description: { type: 'string', nullable: true },
                  privacy: {
                    type: 'object',
                    properties: {
                      view: {
                        type: 'string',
                        enum: ['public', 'anyone_with_link'],
                        default: 'public',
                        description: 'Who can view the recipe.',
                      },
                    },
                    additionalProperties: false,
                  },
                  title: { type: 'string' },
                },
                required: ['content', 'description', 'title'],
                additionalProperties: false,
              },
            },
          },
          required: true,
        },
        parameters: [
          {
            schema: {
              type: 'string',
              pattern: '(v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?',
            },
            in: 'path',
            name: 'branch',
            required: true,
            description: "Project version number, `stable` for your project's stable version, or a valid branch name.",
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
                            background_color: {
                              type: 'string',
                              pattern: '^(?:#[0-9a-fA-F]{3}|#[0-9a-fA-F]{4}|#[0-9a-fA-F]{6}|#[0-9a-fA-F]{8})$',
                              default: '#000000',
                              description: 'The color of the recipe card.',
                            },
                            emoji: {
                              type: 'string',
                              nullable: true,
                              description: 'The Unicode emoji to be displayed within the recipe card.',
                            },
                          },
                          required: ['emoji'],
                          additionalProperties: false,
                        },
                        connections: {
                          type: 'object',
                          properties: {
                            references: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  uri: {
                                    type: 'string',
                                    pattern:
                                      '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/(guides|reference)\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                                    description:
                                      'URI of the API reference page that this recipe will be connected to. The API reference and recipe must exist within the same version.',
                                  },
                                },
                                required: ['uri'],
                                additionalProperties: false,
                              },
                              nullable: true,
                              description: 'A collection of API reference pages that this recipe will be displayed on.',
                            },
                          },
                          required: ['references'],
                          additionalProperties: false,
                        },
                        content: {
                          type: 'object',
                          properties: {
                            steps: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  title: { type: 'string', description: 'Title of the step.' },
                                  body: { type: 'string', nullable: true, description: 'Content of the step.' },
                                  line_numbers: {
                                    type: 'array',
                                    items: { type: 'string' },
                                    description:
                                      'Line numbers to highlight in the code snippet. (e.g. `["1-5", "10"]).',
                                  },
                                },
                                required: ['title', 'body', 'line_numbers'],
                                additionalProperties: false,
                              },
                            },
                            snippet: {
                              type: 'object',
                              properties: {
                                code_options: {
                                  type: 'array',
                                  items: {
                                    type: 'object',
                                    properties: {
                                      code: {
                                        type: 'string',
                                        nullable: true,
                                        description: 'Code to display for the specific language.',
                                      },
                                      language: { type: 'string', description: 'Language of the code snippet.' },
                                      name: {
                                        type: 'string',
                                        nullable: true,
                                        description: 'Name of the code snippet.',
                                      },
                                      highlighted_syntax: {
                                        type: 'string',
                                        description: 'Actual syntax highlighter to use on the code snippet.',
                                      },
                                    },
                                    required: ['code', 'language'],
                                    additionalProperties: false,
                                  },
                                  description: 'Array of code snippets to display in the recipe.',
                                },
                              },
                              required: ['code_options'],
                              additionalProperties: false,
                            },
                            response: {
                              type: 'string',
                              nullable: true,
                              description: 'Example response to display in the recipe.',
                            },
                          },
                          required: ['steps', 'snippet', 'response'],
                          additionalProperties: false,
                        },
                        description: { type: 'string', nullable: true },
                        privacy: {
                          type: 'object',
                          properties: {
                            view: {
                              type: 'string',
                              enum: ['public', 'anyone_with_link'],
                              default: 'public',
                              description: 'Who can view the recipe.',
                            },
                          },
                          additionalProperties: false,
                        },
                        title: { type: 'string' },
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
                        slug: { type: 'string' },
                        uri: {
                          type: 'string',
                          pattern:
                            '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/recipes\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                        },
                      },
                      required: [
                        'appearance',
                        'connections',
                        'content',
                        'description',
                        'privacy',
                        'title',
                        'links',
                        'slug',
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
    '/branches/{branch}/recipes/{slug}': {
      get: {
        operationId: 'getRecipe',
        summary: 'Get a recipe',
        tags: ['Recipes'],
        description:
          'Get a recipe from your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).',
        parameters: [
          {
            schema: {
              type: 'string',
              pattern: '(v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?',
            },
            in: 'path',
            name: 'branch',
            required: true,
            description: "Project version number, `stable` for your project's stable version, or a valid branch name.",
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
                            background_color: {
                              type: 'string',
                              pattern: '^(?:#[0-9a-fA-F]{3}|#[0-9a-fA-F]{4}|#[0-9a-fA-F]{6}|#[0-9a-fA-F]{8})$',
                              default: '#000000',
                              description: 'The color of the recipe card.',
                            },
                            emoji: {
                              type: 'string',
                              nullable: true,
                              description: 'The Unicode emoji to be displayed within the recipe card.',
                            },
                          },
                          required: ['emoji'],
                          additionalProperties: false,
                        },
                        connections: {
                          type: 'object',
                          properties: {
                            references: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  uri: {
                                    type: 'string',
                                    pattern:
                                      '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/(guides|reference)\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                                    description:
                                      'URI of the API reference page that this recipe will be connected to. The API reference and recipe must exist within the same version.',
                                  },
                                },
                                required: ['uri'],
                                additionalProperties: false,
                              },
                              nullable: true,
                              description: 'A collection of API reference pages that this recipe will be displayed on.',
                            },
                          },
                          required: ['references'],
                          additionalProperties: false,
                        },
                        content: {
                          type: 'object',
                          properties: {
                            steps: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  title: { type: 'string', description: 'Title of the step.' },
                                  body: { type: 'string', nullable: true, description: 'Content of the step.' },
                                  line_numbers: {
                                    type: 'array',
                                    items: { type: 'string' },
                                    description:
                                      'Line numbers to highlight in the code snippet. (e.g. `["1-5", "10"]).',
                                  },
                                },
                                required: ['title', 'body', 'line_numbers'],
                                additionalProperties: false,
                              },
                            },
                            snippet: {
                              type: 'object',
                              properties: {
                                code_options: {
                                  type: 'array',
                                  items: {
                                    type: 'object',
                                    properties: {
                                      code: {
                                        type: 'string',
                                        nullable: true,
                                        description: 'Code to display for the specific language.',
                                      },
                                      language: { type: 'string', description: 'Language of the code snippet.' },
                                      name: {
                                        type: 'string',
                                        nullable: true,
                                        description: 'Name of the code snippet.',
                                      },
                                      highlighted_syntax: {
                                        type: 'string',
                                        description: 'Actual syntax highlighter to use on the code snippet.',
                                      },
                                    },
                                    required: ['code', 'language'],
                                    additionalProperties: false,
                                  },
                                  description: 'Array of code snippets to display in the recipe.',
                                },
                              },
                              required: ['code_options'],
                              additionalProperties: false,
                            },
                            response: {
                              type: 'string',
                              nullable: true,
                              description: 'Example response to display in the recipe.',
                            },
                          },
                          required: ['steps', 'snippet', 'response'],
                          additionalProperties: false,
                        },
                        description: { type: 'string', nullable: true },
                        privacy: {
                          type: 'object',
                          properties: {
                            view: {
                              type: 'string',
                              enum: ['public', 'anyone_with_link'],
                              default: 'public',
                              description: 'Who can view the recipe.',
                            },
                          },
                          additionalProperties: false,
                        },
                        title: { type: 'string' },
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
                        slug: { type: 'string' },
                        uri: {
                          type: 'string',
                          pattern:
                            '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/recipes\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                        },
                      },
                      required: [
                        'appearance',
                        'connections',
                        'content',
                        'description',
                        'privacy',
                        'title',
                        'links',
                        'slug',
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
        operationId: 'deleteRecipe',
        summary: 'Delete a recipe',
        tags: ['Recipes'],
        description:
          'Delete a recipe from your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).',
        parameters: [
          {
            schema: {
              type: 'string',
              pattern: '(v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?',
            },
            in: 'path',
            name: 'branch',
            required: true,
            description: "Project version number, `stable` for your project's stable version, or a valid branch name.",
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
        operationId: 'updateRecipe',
        summary: 'Update an existing recipe',
        tags: ['Recipes'],
        description:
          'Update an existing recipe in your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  appearance: {
                    type: 'object',
                    properties: {
                      background_color: {
                        type: 'string',
                        pattern: '^(?:#[0-9a-fA-F]{3}|#[0-9a-fA-F]{4}|#[0-9a-fA-F]{6}|#[0-9a-fA-F]{8})$',
                        default: '#000000',
                        description: 'The color of the recipe card.',
                      },
                      emoji: { type: 'string', nullable: true },
                    },
                    additionalProperties: false,
                  },
                  connections: {
                    type: 'object',
                    properties: {
                      references: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            uri: {
                              type: 'string',
                              pattern:
                                '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/(guides|reference)\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                              description:
                                'URI of the API reference page that this recipe will be connected to. The API reference and recipe must exist within the same version.',
                            },
                          },
                          additionalProperties: false,
                        },
                        nullable: true,
                      },
                    },
                    additionalProperties: false,
                  },
                  content: {
                    type: 'object',
                    properties: {
                      steps: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            title: { type: 'string', description: 'Title of the step.' },
                            body: { type: 'string', nullable: true },
                            line_numbers: {
                              type: 'array',
                              items: { type: 'string' },
                              description: 'Line numbers to highlight in the code snippet. (e.g. `["1-5", "10"]).',
                            },
                          },
                          additionalProperties: false,
                        },
                      },
                      snippet: {
                        type: 'object',
                        properties: {
                          code_options: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                code: { type: 'string', nullable: true },
                                language: { type: 'string', description: 'Language of the code snippet.' },
                                name: { type: 'string', nullable: true },
                                highlighted_syntax: { type: 'string' },
                              },
                              additionalProperties: false,
                            },
                            description: 'Array of code snippets to display in the recipe.',
                          },
                        },
                        additionalProperties: false,
                      },
                      response: { type: 'string', nullable: true },
                    },
                    additionalProperties: false,
                  },
                  description: { type: 'string', nullable: true },
                  privacy: {
                    type: 'object',
                    properties: {
                      view: {
                        type: 'string',
                        enum: ['public', 'anyone_with_link'],
                        default: 'public',
                        description: 'Who can view the recipe.',
                      },
                    },
                    additionalProperties: false,
                  },
                  title: { type: 'string' },
                  position: {
                    type: 'number',
                    description: 'The position where this recipe should be displayed on your recipe landing page.',
                  },
                },
                additionalProperties: false,
              },
            },
          },
        },
        parameters: [
          {
            schema: {
              type: 'string',
              pattern: '(v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?',
            },
            in: 'path',
            name: 'branch',
            required: true,
            description: "Project version number, `stable` for your project's stable version, or a valid branch name.",
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
                            background_color: {
                              type: 'string',
                              pattern: '^(?:#[0-9a-fA-F]{3}|#[0-9a-fA-F]{4}|#[0-9a-fA-F]{6}|#[0-9a-fA-F]{8})$',
                              default: '#000000',
                              description: 'The color of the recipe card.',
                            },
                            emoji: {
                              type: 'string',
                              nullable: true,
                              description: 'The Unicode emoji to be displayed within the recipe card.',
                            },
                          },
                          required: ['emoji'],
                          additionalProperties: false,
                        },
                        connections: {
                          type: 'object',
                          properties: {
                            references: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  uri: {
                                    type: 'string',
                                    pattern:
                                      '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/(guides|reference)\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                                    description:
                                      'URI of the API reference page that this recipe will be connected to. The API reference and recipe must exist within the same version.',
                                  },
                                },
                                required: ['uri'],
                                additionalProperties: false,
                              },
                              nullable: true,
                              description: 'A collection of API reference pages that this recipe will be displayed on.',
                            },
                          },
                          required: ['references'],
                          additionalProperties: false,
                        },
                        content: {
                          type: 'object',
                          properties: {
                            steps: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  title: { type: 'string', description: 'Title of the step.' },
                                  body: { type: 'string', nullable: true, description: 'Content of the step.' },
                                  line_numbers: {
                                    type: 'array',
                                    items: { type: 'string' },
                                    description:
                                      'Line numbers to highlight in the code snippet. (e.g. `["1-5", "10"]).',
                                  },
                                },
                                required: ['title', 'body', 'line_numbers'],
                                additionalProperties: false,
                              },
                            },
                            snippet: {
                              type: 'object',
                              properties: {
                                code_options: {
                                  type: 'array',
                                  items: {
                                    type: 'object',
                                    properties: {
                                      code: {
                                        type: 'string',
                                        nullable: true,
                                        description: 'Code to display for the specific language.',
                                      },
                                      language: { type: 'string', description: 'Language of the code snippet.' },
                                      name: {
                                        type: 'string',
                                        nullable: true,
                                        description: 'Name of the code snippet.',
                                      },
                                      highlighted_syntax: {
                                        type: 'string',
                                        description: 'Actual syntax highlighter to use on the code snippet.',
                                      },
                                    },
                                    required: ['code', 'language'],
                                    additionalProperties: false,
                                  },
                                  description: 'Array of code snippets to display in the recipe.',
                                },
                              },
                              required: ['code_options'],
                              additionalProperties: false,
                            },
                            response: {
                              type: 'string',
                              nullable: true,
                              description: 'Example response to display in the recipe.',
                            },
                          },
                          required: ['steps', 'snippet', 'response'],
                          additionalProperties: false,
                        },
                        description: { type: 'string', nullable: true },
                        privacy: {
                          type: 'object',
                          properties: {
                            view: {
                              type: 'string',
                              enum: ['public', 'anyone_with_link'],
                              default: 'public',
                              description: 'Who can view the recipe.',
                            },
                          },
                          additionalProperties: false,
                        },
                        title: { type: 'string' },
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
                        slug: { type: 'string' },
                        uri: {
                          type: 'string',
                          pattern:
                            '\\/(versions|branches)\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)\\/recipes\\/(([a-z0-9-_ ]|[^\\\\x00-\\\\x7F])+)',
                        },
                      },
                      required: [
                        'appearance',
                        'connections',
                        'content',
                        'description',
                        'privacy',
                        'title',
                        'links',
                        'slug',
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
    '/search': {
      get: {
        operationId: 'search',
        summary: 'Perform a search query',
        tags: ['Search'],
        description: 'Searches the ReadMe project.',
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
            description:
              'The section of your ReadMe project to search within. If omitted, all enabled sections are searched.',
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
            description:
              'Limit search to only these projects in an Enterprise group. If omitted, all child projects with the appropriate permissions are searched. This parameter is only applicable to Enterprise projects.',
          },
          {
            schema: { type: 'number', minimum: 1, default: 1 },
            in: 'query',
            name: 'page',
            required: false,
            description:
              'Used to specify further pages (starts at 1). The product of `page` and `per_page` may not exceed 1000.',
          },
          {
            schema: { type: 'number', minimum: 1, maximum: 50, default: 15 },
            in: 'query',
            name: 'per_page',
            required: false,
            description: 'Number of items to include in pagination (up to 50).',
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
                                value: { type: 'string' },
                                type: { type: 'string', enum: ['hit', 'text'] },
                              },
                              required: ['value', 'type'],
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
                  required: ['total', 'page', 'per_page', 'paging', 'data'],
                  additionalProperties: false,
                },
              },
            },
          },
        },
      },
    },
    '/validate/api': {
      post: {
        operationId: 'validateAPI',
        summary: 'Validate an API',
        tags: ['APIs'],
        description: 'Validates an API definition for uploading to your ReadMe project.',
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
                description:
                  'The API definition to upload. We provide full support for OpenAPI 3.x and Swagger 2.0 and experimental support for Postman collections.',
              },
            },
          },
          description:
            'The API definition to upload. We provide full support for OpenAPI 3.x and Swagger 2.0 and experimental support for Postman collections.',
        },
        security: [],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { schema: { type: 'object', additionalProperties: {}, description: 'The API schema.' } },
                  required: ['schema'],
                  additionalProperties: false,
                },
              },
            },
          },
        },
      },
    },
    '/branches': {
      get: {
        operationId: 'getBranches',
        summary: 'Get branches',
        tags: ['Branches'],
        description:
          'Get a collection of branches in your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).',
        parameters: [
          {
            schema: { type: 'string', enum: ['created', 'review_status', 'semver', 'updated'], default: 'semver' },
            in: 'query',
            name: 'sort_by',
            required: false,
            description: 'The sort that should be used for the returned collection.',
          },
          {
            schema: { type: 'string', pattern: 'stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?' },
            in: 'query',
            name: 'prefix',
            required: false,
            description: 'An optional prefix in the format of `v2.0` used to list all branches with this prefix.',
          },
        ],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  anyOf: [
                    {
                      type: 'object',
                      properties: {
                        total: { type: 'number' },
                        data: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              base: {
                                type: 'string',
                                nullable: true,
                                description: 'The name of the version this version was based off of.',
                              },
                              display_name: {
                                type: 'string',
                                nullable: true,
                                description: 'A non-semver display name for the version.',
                              },
                              i18n: {
                                type: 'object',
                                properties: {
                                  lang: { type: 'string', nullable: true, description: 'The language of the version.' },
                                  parsed_version: {
                                    type: 'string',
                                    nullable: true,
                                    description: 'The parsed version without the language code.',
                                  },
                                },
                                required: ['lang', 'parsed_version'],
                                additionalProperties: false,
                                description:
                                  'Internationalization information for the version. This feature is gated and still in active development, so the values in this object will generally be set to `null`.',
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
                                description: 'Whether the version is released or in beta.',
                              },
                              source: {
                                type: 'string',
                                enum: ['readme', 'bidi'],
                                description: 'Whether the version was created in ReadMe or via Bi-Directional Sync.',
                              },
                              state: {
                                type: 'string',
                                enum: ['current', 'deprecated'],
                                description: 'Whether the version is current or deprecated.',
                              },
                              updated_at: {
                                type: 'string',
                                format: 'date-time',
                                description: 'An ISO 8601 formatted date for when the version was last updated.',
                              },
                              uri: {
                                type: 'string',
                                pattern:
                                  '\\/branches\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)',
                                description: 'A URI to the version resource.',
                              },
                            },
                            required: [
                              'base',
                              'display_name',
                              'i18n',
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
                        type: { type: 'string', enum: ['version'] },
                      },
                      required: ['total', 'data', 'type'],
                      additionalProperties: false,
                    },
                    {
                      type: 'object',
                      properties: {
                        total: { type: 'number' },
                        data: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              base: {
                                type: 'object',
                                properties: {
                                  base: {
                                    type: 'string',
                                    nullable: true,
                                    description: 'The name of the version this version was based off of.',
                                  },
                                  display_name: {
                                    type: 'string',
                                    nullable: true,
                                    description: 'A non-semver display name for the version.',
                                  },
                                  i18n: {
                                    type: 'object',
                                    properties: {
                                      lang: {
                                        type: 'string',
                                        nullable: true,
                                        description: 'The language of the version.',
                                      },
                                      parsed_version: {
                                        type: 'string',
                                        nullable: true,
                                        description: 'The parsed version without the language code.',
                                      },
                                    },
                                    required: ['lang', 'parsed_version'],
                                    additionalProperties: false,
                                    description:
                                      'Internationalization information for the version. This feature is gated and still in active development, so the values in this object will generally be set to `null`.',
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
                                    description: 'Whether the version is released or in beta.',
                                  },
                                  source: {
                                    type: 'string',
                                    enum: ['readme', 'bidi'],
                                    description:
                                      'Whether the version was created in ReadMe or via Bi-Directional Sync.',
                                  },
                                  state: {
                                    type: 'string',
                                    enum: ['current', 'deprecated'],
                                    description: 'Whether the version is current or deprecated.',
                                  },
                                  updated_at: {
                                    type: 'string',
                                    format: 'date-time',
                                    description: 'An ISO 8601 formatted date for when the version was last updated.',
                                  },
                                  uri: {
                                    type: 'string',
                                    pattern:
                                      '\\/branches\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)',
                                    description: 'A URI to the version resource.',
                                  },
                                },
                                required: [
                                  'base',
                                  'display_name',
                                  'i18n',
                                  'name',
                                  'privacy',
                                  'release_stage',
                                  'source',
                                  'state',
                                  'updated_at',
                                  'uri',
                                ],
                                additionalProperties: false,
                                description:
                                  'The representation of the version the branch was created from or the stable version.',
                              },
                              href: {
                                type: 'object',
                                properties: {
                                  external: {
                                    type: 'object',
                                    properties: {
                                      diff: {
                                        type: 'string',
                                        nullable: true,
                                        description:
                                          'A link to the external branch diff on bi-directionally synced projects.',
                                      },
                                      view: {
                                        type: 'string',
                                        nullable: true,
                                        description:
                                          'A link to view the external branch on bi-directionally synced projects.',
                                      },
                                    },
                                    required: ['diff', 'view'],
                                    additionalProperties: false,
                                  },
                                },
                                required: ['external'],
                                additionalProperties: false,
                              },
                              name: {
                                type: 'string',
                                pattern: '(v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?',
                                description: 'The name of the branch and its version prefix.',
                              },
                              updated_at: {
                                type: 'string',
                                format: 'date-time',
                                description: 'An ISO 8601 formatted date for when the branch was last updated.',
                              },
                              uri: {
                                type: 'string',
                                pattern:
                                  '\\/branches\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)',
                                description: 'A URI to the branch resource.',
                              },
                              review: {
                                type: 'object',
                                properties: {
                                  branch: {
                                    type: 'object',
                                    properties: {
                                      uri: {
                                        type: 'string',
                                        description:
                                          'A URI to the version or branch resource that this custom block belongs to.',
                                      },
                                      name: {
                                        type: 'string',
                                        description:
                                          'A friendly name automatically generated from your internal version number or branch name.',
                                      },
                                    },
                                    required: ['uri', 'name'],
                                    additionalProperties: false,
                                  },
                                  status: {
                                    type: 'string',
                                    enum: ['draft', 'ready', 'approved'],
                                    default: 'draft',
                                    description: 'The current review status.',
                                  },
                                  reviewers: {
                                    type: 'array',
                                    items: {
                                      type: 'object',
                                      properties: {
                                        user: {
                                          type: 'object',
                                          properties: {
                                            email: {
                                              type: 'string',
                                              nullable: true,
                                              default: null,
                                              description: 'The email address of the user who approved the branch.',
                                            },
                                            name: {
                                              type: 'string',
                                              nullable: true,
                                              default: null,
                                              description: 'The name of the user who approved the branch.',
                                            },
                                          },
                                          additionalProperties: false,
                                          description: 'Information about the user who approved the branch.',
                                        },
                                        action: {
                                          type: 'string',
                                          enum: ['approve', 'revoke'],
                                          description: 'The action taken by the user when the review was made.',
                                        },
                                        created_at: {
                                          type: 'string',
                                          format: 'date-time',
                                          description: 'An ISO 8601 formatted date for when the reviewer was created.',
                                        },
                                        updated_at: {
                                          type: 'string',
                                          format: 'date-time',
                                          nullable: true,
                                          default: null,
                                          description:
                                            'An ISO 8601 formatted date for when the reviewer was last updated.',
                                        },
                                      },
                                      required: ['user', 'action', 'created_at'],
                                      additionalProperties: false,
                                    },
                                    default: [],
                                    description: 'A list of reviewers.',
                                  },
                                  ready_at: {
                                    type: 'string',
                                    nullable: true,
                                    default: null,
                                    description: 'An ISO 8601 formatted date for when the review was set to ready.',
                                  },
                                  ready_by: {
                                    type: 'object',
                                    properties: {
                                      email: {
                                        type: 'string',
                                        nullable: true,
                                        default: null,
                                        description: 'User email who set the review to ready.',
                                      },
                                      name: {
                                        type: 'string',
                                        nullable: true,
                                        default: null,
                                        description: 'User name who set the review to ready.',
                                      },
                                    },
                                    additionalProperties: false,
                                    description: 'User who set the review to ready',
                                  },
                                  created_by: {
                                    type: 'object',
                                    properties: {
                                      email: {
                                        type: 'string',
                                        nullable: true,
                                        default: null,
                                        description: 'User email who created the branch.',
                                      },
                                      name: {
                                        type: 'string',
                                        nullable: true,
                                        default: null,
                                        description: 'User name who created the branch.',
                                      },
                                    },
                                    additionalProperties: false,
                                    description: 'User who created the branch.',
                                  },
                                  merged_at: {
                                    type: 'string',
                                    nullable: true,
                                    default: null,
                                    description: 'An ISO 8601 formatted date for when the branch was last merged.',
                                  },
                                  contributors: {
                                    type: 'array',
                                    items: {
                                      type: 'object',
                                      properties: {
                                        user: {
                                          type: 'object',
                                          properties: {
                                            email: {
                                              type: 'string',
                                              nullable: true,
                                              default: null,
                                              description:
                                                'The email address of the user who contributed to the branch.',
                                            },
                                            name: {
                                              type: 'string',
                                              nullable: true,
                                              default: null,
                                              description:
                                                'The email address of the user who contributed to the branch.',
                                            },
                                          },
                                          additionalProperties: false,
                                          description: 'Information about the user who contributed to the branch.',
                                        },
                                        updated_at: {
                                          type: 'string',
                                          format: 'date-time',
                                          nullable: true,
                                          default: null,
                                          description:
                                            'An ISO 8601 formatted date for when the contributor last updated.',
                                        },
                                      },
                                      required: ['user'],
                                      additionalProperties: false,
                                    },
                                    default: [],
                                    description: 'A list of contributors to the branch.',
                                  },
                                  tagged_reviewers: {
                                    type: 'array',
                                    items: {
                                      type: 'object',
                                      properties: {
                                        user: {
                                          type: 'object',
                                          properties: {
                                            email: {
                                              type: 'string',
                                              nullable: true,
                                              default: null,
                                              description: 'The email address of the tagged reviewer.',
                                            },
                                            name: {
                                              type: 'string',
                                              nullable: true,
                                              default: null,
                                              description: 'The name of the tagged reviewer.',
                                            },
                                          },
                                          additionalProperties: false,
                                          description: 'Information about the tagged reviewer.',
                                        },
                                        requested_at: {
                                          type: 'string',
                                          format: 'date-time',
                                          description: 'An ISO 8601 formatted date for when the reviewer was tagged.',
                                        },
                                        requested_by: {
                                          type: 'object',
                                          properties: {
                                            email: {
                                              type: 'string',
                                              nullable: true,
                                              default: null,
                                              description: 'The email address of the user who requested the review.',
                                            },
                                            name: {
                                              type: 'string',
                                              nullable: true,
                                              default: null,
                                              description: 'The name of the user who requested the review.',
                                            },
                                          },
                                          additionalProperties: false,
                                          description: 'The user who requested the review.',
                                        },
                                      },
                                      required: ['user', 'requested_at', 'requested_by'],
                                      additionalProperties: false,
                                    },
                                    default: [],
                                    description: 'A list of tagged reviewers for this branch.',
                                  },
                                  updated_at: {
                                    type: 'string',
                                    format: 'date-time',
                                    description: 'An ISO 8601 formatted date for when the review was last updated.',
                                  },
                                  report: {
                                    type: 'object',
                                    properties: {
                                      id: {
                                        type: 'string',
                                        nullable: true,
                                        default: null,
                                        description: 'A report id or matching job id.',
                                      },
                                    },
                                    additionalProperties: false,
                                    description: 'Information about the reporting job',
                                  },
                                  project: {
                                    type: 'string',
                                    description: 'The project ID that this review belongs to.',
                                  },
                                  notification_settings: {
                                    type: 'object',
                                    properties: {
                                      branch_topic_key: {
                                        type: 'string',
                                        nullable: true,
                                        default: null,
                                        description:
                                          'The Novu Topic Key associated with this branch for managing notification subscriptions.',
                                      },
                                    },
                                    additionalProperties: false,
                                    description: 'Notification settings for the branch review.',
                                  },
                                },
                                required: [
                                  'branch',
                                  'ready_by',
                                  'created_by',
                                  'updated_at',
                                  'report',
                                  'project',
                                  'notification_settings',
                                ],
                                additionalProperties: false,
                                description: 'The review status to the branch resource.',
                              },
                            },
                            required: ['base', 'href', 'name', 'updated_at', 'uri', 'review'],
                            additionalProperties: false,
                          },
                        },
                        type: { type: 'string', enum: ['branch'] },
                      },
                      required: ['total', 'data', 'type'],
                      additionalProperties: false,
                    },
                  ],
                },
              },
            },
          },
        },
      },
      post: {
        operationId: 'createBranch',
        summary: 'Create a branch',
        tags: ['Branches'],
        description:
          'Create a new branch in your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                anyOf: [
                  {
                    type: 'object',
                    properties: {
                      base: {
                        type: 'string',
                        description:
                          'The clean string of version we are basing off of. Defaults to the stable version.',
                      },
                      display_name: { type: 'string', description: 'A non-semver display name for the version.' },
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
                            default: 'hidden',
                            description:
                              "Whether the version is public, hidden, or the stable version that's visible by default.",
                          },
                        },
                        additionalProperties: false,
                      },
                      release_stage: {
                        type: 'string',
                        enum: ['beta', 'release'],
                        default: 'release',
                        description: 'Whether the version is released or in beta.',
                      },
                      state: {
                        type: 'string',
                        enum: ['current', 'deprecated'],
                        default: 'current',
                        description: 'Whether the version is current or deprecated.',
                      },
                    },
                    required: ['name'],
                    additionalProperties: false,
                  },
                  {
                    type: 'object',
                    properties: {
                      name: {
                        type: 'string',
                        pattern: '(v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?',
                        description: 'The name of the branch.',
                      },
                    },
                    required: ['name'],
                    additionalProperties: false,
                  },
                ],
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Created',
            content: {
              'application/json': {
                schema: {
                  anyOf: [
                    {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            base: {
                              type: 'string',
                              nullable: true,
                              description: 'The name of the version this version was based off of.',
                            },
                            display_name: {
                              type: 'string',
                              nullable: true,
                              description: 'A non-semver display name for the version.',
                            },
                            i18n: {
                              type: 'object',
                              properties: {
                                lang: { type: 'string', nullable: true, description: 'The language of the version.' },
                                parsed_version: {
                                  type: 'string',
                                  nullable: true,
                                  description: 'The parsed version without the language code.',
                                },
                              },
                              required: ['lang', 'parsed_version'],
                              additionalProperties: false,
                              description:
                                'Internationalization information for the version. This feature is gated and still in active development, so the values in this object will generally be set to `null`.',
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
                              description: 'Whether the version is released or in beta.',
                            },
                            source: {
                              type: 'string',
                              enum: ['readme', 'bidi'],
                              description: 'Whether the version was created in ReadMe or via Bi-Directional Sync.',
                            },
                            state: {
                              type: 'string',
                              enum: ['current', 'deprecated'],
                              description: 'Whether the version is current or deprecated.',
                            },
                            updated_at: {
                              type: 'string',
                              format: 'date-time',
                              description: 'An ISO 8601 formatted date for when the version was last updated.',
                            },
                            uri: {
                              type: 'string',
                              pattern:
                                '\\/branches\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)',
                              description: 'A URI to the version resource.',
                            },
                          },
                          required: [
                            'base',
                            'display_name',
                            'i18n',
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
                        type: { type: 'string', enum: ['version'] },
                      },
                      required: ['data', 'type'],
                      additionalProperties: false,
                    },
                    {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            base: {
                              type: 'object',
                              properties: {
                                base: {
                                  type: 'string',
                                  nullable: true,
                                  description: 'The name of the version this version was based off of.',
                                },
                                display_name: {
                                  type: 'string',
                                  nullable: true,
                                  description: 'A non-semver display name for the version.',
                                },
                                i18n: {
                                  type: 'object',
                                  properties: {
                                    lang: {
                                      type: 'string',
                                      nullable: true,
                                      description: 'The language of the version.',
                                    },
                                    parsed_version: {
                                      type: 'string',
                                      nullable: true,
                                      description: 'The parsed version without the language code.',
                                    },
                                  },
                                  required: ['lang', 'parsed_version'],
                                  additionalProperties: false,
                                  description:
                                    'Internationalization information for the version. This feature is gated and still in active development, so the values in this object will generally be set to `null`.',
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
                                  description: 'Whether the version is released or in beta.',
                                },
                                source: {
                                  type: 'string',
                                  enum: ['readme', 'bidi'],
                                  description: 'Whether the version was created in ReadMe or via Bi-Directional Sync.',
                                },
                                state: {
                                  type: 'string',
                                  enum: ['current', 'deprecated'],
                                  description: 'Whether the version is current or deprecated.',
                                },
                                updated_at: {
                                  type: 'string',
                                  format: 'date-time',
                                  description: 'An ISO 8601 formatted date for when the version was last updated.',
                                },
                                uri: {
                                  type: 'string',
                                  pattern:
                                    '\\/branches\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)',
                                  description: 'A URI to the version resource.',
                                },
                              },
                              required: [
                                'base',
                                'display_name',
                                'i18n',
                                'name',
                                'privacy',
                                'release_stage',
                                'source',
                                'state',
                                'updated_at',
                                'uri',
                              ],
                              additionalProperties: false,
                              description:
                                'The representation of the version the branch was created from or the stable version.',
                            },
                            href: {
                              type: 'object',
                              properties: {
                                external: {
                                  type: 'object',
                                  properties: {
                                    diff: {
                                      type: 'string',
                                      nullable: true,
                                      description:
                                        'A link to the external branch diff on bi-directionally synced projects.',
                                    },
                                    view: {
                                      type: 'string',
                                      nullable: true,
                                      description:
                                        'A link to view the external branch on bi-directionally synced projects.',
                                    },
                                  },
                                  required: ['diff', 'view'],
                                  additionalProperties: false,
                                },
                              },
                              required: ['external'],
                              additionalProperties: false,
                            },
                            name: {
                              type: 'string',
                              pattern: '(v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?',
                              description: 'The name of the branch and its version prefix.',
                            },
                            updated_at: {
                              type: 'string',
                              format: 'date-time',
                              description: 'An ISO 8601 formatted date for when the branch was last updated.',
                            },
                            uri: {
                              type: 'string',
                              pattern:
                                '\\/branches\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)',
                              description: 'A URI to the branch resource.',
                            },
                            review: {
                              type: 'object',
                              properties: {
                                branch: {
                                  type: 'object',
                                  properties: {
                                    uri: {
                                      type: 'string',
                                      description:
                                        'A URI to the version or branch resource that this custom block belongs to.',
                                    },
                                    name: {
                                      type: 'string',
                                      description:
                                        'A friendly name automatically generated from your internal version number or branch name.',
                                    },
                                  },
                                  required: ['uri', 'name'],
                                  additionalProperties: false,
                                },
                                status: {
                                  type: 'string',
                                  enum: ['draft', 'ready', 'approved'],
                                  default: 'draft',
                                  description: 'The current review status.',
                                },
                                reviewers: {
                                  type: 'array',
                                  items: {
                                    type: 'object',
                                    properties: {
                                      user: {
                                        type: 'object',
                                        properties: {
                                          email: {
                                            type: 'string',
                                            nullable: true,
                                            default: null,
                                            description: 'The email address of the user who approved the branch.',
                                          },
                                          name: {
                                            type: 'string',
                                            nullable: true,
                                            default: null,
                                            description: 'The name of the user who approved the branch.',
                                          },
                                        },
                                        additionalProperties: false,
                                        description: 'Information about the user who approved the branch.',
                                      },
                                      action: {
                                        type: 'string',
                                        enum: ['approve', 'revoke'],
                                        description: 'The action taken by the user when the review was made.',
                                      },
                                      created_at: {
                                        type: 'string',
                                        format: 'date-time',
                                        description: 'An ISO 8601 formatted date for when the reviewer was created.',
                                      },
                                      updated_at: {
                                        type: 'string',
                                        format: 'date-time',
                                        nullable: true,
                                        default: null,
                                        description:
                                          'An ISO 8601 formatted date for when the reviewer was last updated.',
                                      },
                                    },
                                    required: ['user', 'action', 'created_at'],
                                    additionalProperties: false,
                                  },
                                  default: [],
                                  description: 'A list of reviewers.',
                                },
                                ready_at: {
                                  type: 'string',
                                  nullable: true,
                                  default: null,
                                  description: 'An ISO 8601 formatted date for when the review was set to ready.',
                                },
                                ready_by: {
                                  type: 'object',
                                  properties: {
                                    email: {
                                      type: 'string',
                                      nullable: true,
                                      default: null,
                                      description: 'User email who set the review to ready.',
                                    },
                                    name: {
                                      type: 'string',
                                      nullable: true,
                                      default: null,
                                      description: 'User name who set the review to ready.',
                                    },
                                  },
                                  additionalProperties: false,
                                  description: 'User who set the review to ready',
                                },
                                created_by: {
                                  type: 'object',
                                  properties: {
                                    email: {
                                      type: 'string',
                                      nullable: true,
                                      default: null,
                                      description: 'User email who created the branch.',
                                    },
                                    name: {
                                      type: 'string',
                                      nullable: true,
                                      default: null,
                                      description: 'User name who created the branch.',
                                    },
                                  },
                                  additionalProperties: false,
                                  description: 'User who created the branch.',
                                },
                                merged_at: {
                                  type: 'string',
                                  nullable: true,
                                  default: null,
                                  description: 'An ISO 8601 formatted date for when the branch was last merged.',
                                },
                                contributors: {
                                  type: 'array',
                                  items: {
                                    type: 'object',
                                    properties: {
                                      user: {
                                        type: 'object',
                                        properties: {
                                          email: {
                                            type: 'string',
                                            nullable: true,
                                            default: null,
                                            description: 'The email address of the user who contributed to the branch.',
                                          },
                                          name: {
                                            type: 'string',
                                            nullable: true,
                                            default: null,
                                            description: 'The email address of the user who contributed to the branch.',
                                          },
                                        },
                                        additionalProperties: false,
                                        description: 'Information about the user who contributed to the branch.',
                                      },
                                      updated_at: {
                                        type: 'string',
                                        format: 'date-time',
                                        nullable: true,
                                        default: null,
                                        description:
                                          'An ISO 8601 formatted date for when the contributor last updated.',
                                      },
                                    },
                                    required: ['user'],
                                    additionalProperties: false,
                                  },
                                  default: [],
                                  description: 'A list of contributors to the branch.',
                                },
                                tagged_reviewers: {
                                  type: 'array',
                                  items: {
                                    type: 'object',
                                    properties: {
                                      user: {
                                        type: 'object',
                                        properties: {
                                          email: {
                                            type: 'string',
                                            nullable: true,
                                            default: null,
                                            description: 'The email address of the tagged reviewer.',
                                          },
                                          name: {
                                            type: 'string',
                                            nullable: true,
                                            default: null,
                                            description: 'The name of the tagged reviewer.',
                                          },
                                        },
                                        additionalProperties: false,
                                        description: 'Information about the tagged reviewer.',
                                      },
                                      requested_at: {
                                        type: 'string',
                                        format: 'date-time',
                                        description: 'An ISO 8601 formatted date for when the reviewer was tagged.',
                                      },
                                      requested_by: {
                                        type: 'object',
                                        properties: {
                                          email: {
                                            type: 'string',
                                            nullable: true,
                                            default: null,
                                            description: 'The email address of the user who requested the review.',
                                          },
                                          name: {
                                            type: 'string',
                                            nullable: true,
                                            default: null,
                                            description: 'The name of the user who requested the review.',
                                          },
                                        },
                                        additionalProperties: false,
                                        description: 'The user who requested the review.',
                                      },
                                    },
                                    required: ['user', 'requested_at', 'requested_by'],
                                    additionalProperties: false,
                                  },
                                  default: [],
                                  description: 'A list of tagged reviewers for this branch.',
                                },
                                updated_at: {
                                  type: 'string',
                                  format: 'date-time',
                                  description: 'An ISO 8601 formatted date for when the review was last updated.',
                                },
                                report: {
                                  type: 'object',
                                  properties: {
                                    id: {
                                      type: 'string',
                                      nullable: true,
                                      default: null,
                                      description: 'A report id or matching job id.',
                                    },
                                  },
                                  additionalProperties: false,
                                  description: 'Information about the reporting job',
                                },
                                project: { type: 'string', description: 'The project ID that this review belongs to.' },
                                notification_settings: {
                                  type: 'object',
                                  properties: {
                                    branch_topic_key: {
                                      type: 'string',
                                      nullable: true,
                                      default: null,
                                      description:
                                        'The Novu Topic Key associated with this branch for managing notification subscriptions.',
                                    },
                                  },
                                  additionalProperties: false,
                                  description: 'Notification settings for the branch review.',
                                },
                              },
                              required: [
                                'branch',
                                'ready_by',
                                'created_by',
                                'updated_at',
                                'report',
                                'project',
                                'notification_settings',
                              ],
                              additionalProperties: false,
                              description: 'The review status to the branch resource.',
                            },
                          },
                          required: ['base', 'href', 'name', 'updated_at', 'uri', 'review'],
                          additionalProperties: false,
                        },
                        type: { type: 'string', enum: ['branch'] },
                      },
                      required: ['data', 'type'],
                      additionalProperties: false,
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    '/branches/{branch}': {
      get: {
        operationId: 'getBranch',
        summary: 'Get a branch',
        tags: ['Branches'],
        description:
          'Get a branch of your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).',
        parameters: [
          {
            schema: {
              type: 'string',
              pattern: '(v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?',
            },
            in: 'path',
            name: 'branch',
            required: true,
            description: "Project version number, `stable` for your project's stable version, or a valid branch name.",
          },
        ],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  anyOf: [
                    {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            base: {
                              type: 'string',
                              nullable: true,
                              description: 'The name of the version this version was based off of.',
                            },
                            display_name: {
                              type: 'string',
                              nullable: true,
                              description: 'A non-semver display name for the version.',
                            },
                            i18n: {
                              type: 'object',
                              properties: {
                                lang: { type: 'string', nullable: true, description: 'The language of the version.' },
                                parsed_version: {
                                  type: 'string',
                                  nullable: true,
                                  description: 'The parsed version without the language code.',
                                },
                              },
                              required: ['lang', 'parsed_version'],
                              additionalProperties: false,
                              description:
                                'Internationalization information for the version. This feature is gated and still in active development, so the values in this object will generally be set to `null`.',
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
                              description: 'Whether the version is released or in beta.',
                            },
                            source: {
                              type: 'string',
                              enum: ['readme', 'bidi'],
                              description: 'Whether the version was created in ReadMe or via Bi-Directional Sync.',
                            },
                            state: {
                              type: 'string',
                              enum: ['current', 'deprecated'],
                              description: 'Whether the version is current or deprecated.',
                            },
                            updated_at: {
                              type: 'string',
                              format: 'date-time',
                              description: 'An ISO 8601 formatted date for when the version was last updated.',
                            },
                            uri: {
                              type: 'string',
                              pattern:
                                '\\/branches\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)',
                              description: 'A URI to the version resource.',
                            },
                          },
                          required: [
                            'base',
                            'display_name',
                            'i18n',
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
                        type: { type: 'string', enum: ['version'] },
                      },
                      required: ['data', 'type'],
                      additionalProperties: false,
                    },
                    {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            base: {
                              type: 'object',
                              properties: {
                                base: {
                                  type: 'string',
                                  nullable: true,
                                  description: 'The name of the version this version was based off of.',
                                },
                                display_name: {
                                  type: 'string',
                                  nullable: true,
                                  description: 'A non-semver display name for the version.',
                                },
                                i18n: {
                                  type: 'object',
                                  properties: {
                                    lang: {
                                      type: 'string',
                                      nullable: true,
                                      description: 'The language of the version.',
                                    },
                                    parsed_version: {
                                      type: 'string',
                                      nullable: true,
                                      description: 'The parsed version without the language code.',
                                    },
                                  },
                                  required: ['lang', 'parsed_version'],
                                  additionalProperties: false,
                                  description:
                                    'Internationalization information for the version. This feature is gated and still in active development, so the values in this object will generally be set to `null`.',
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
                                  description: 'Whether the version is released or in beta.',
                                },
                                source: {
                                  type: 'string',
                                  enum: ['readme', 'bidi'],
                                  description: 'Whether the version was created in ReadMe or via Bi-Directional Sync.',
                                },
                                state: {
                                  type: 'string',
                                  enum: ['current', 'deprecated'],
                                  description: 'Whether the version is current or deprecated.',
                                },
                                updated_at: {
                                  type: 'string',
                                  format: 'date-time',
                                  description: 'An ISO 8601 formatted date for when the version was last updated.',
                                },
                                uri: {
                                  type: 'string',
                                  pattern:
                                    '\\/branches\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)',
                                  description: 'A URI to the version resource.',
                                },
                              },
                              required: [
                                'base',
                                'display_name',
                                'i18n',
                                'name',
                                'privacy',
                                'release_stage',
                                'source',
                                'state',
                                'updated_at',
                                'uri',
                              ],
                              additionalProperties: false,
                              description:
                                'The representation of the version the branch was created from or the stable version.',
                            },
                            href: {
                              type: 'object',
                              properties: {
                                external: {
                                  type: 'object',
                                  properties: {
                                    diff: {
                                      type: 'string',
                                      nullable: true,
                                      description:
                                        'A link to the external branch diff on bi-directionally synced projects.',
                                    },
                                    view: {
                                      type: 'string',
                                      nullable: true,
                                      description:
                                        'A link to view the external branch on bi-directionally synced projects.',
                                    },
                                  },
                                  required: ['diff', 'view'],
                                  additionalProperties: false,
                                },
                              },
                              required: ['external'],
                              additionalProperties: false,
                            },
                            name: {
                              type: 'string',
                              pattern: '(v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?',
                              description: 'The name of the branch and its version prefix.',
                            },
                            updated_at: {
                              type: 'string',
                              format: 'date-time',
                              description: 'An ISO 8601 formatted date for when the branch was last updated.',
                            },
                            uri: {
                              type: 'string',
                              pattern:
                                '\\/branches\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)',
                              description: 'A URI to the branch resource.',
                            },
                            review: {
                              type: 'object',
                              properties: {
                                branch: {
                                  type: 'object',
                                  properties: {
                                    uri: {
                                      type: 'string',
                                      description:
                                        'A URI to the version or branch resource that this custom block belongs to.',
                                    },
                                    name: {
                                      type: 'string',
                                      description:
                                        'A friendly name automatically generated from your internal version number or branch name.',
                                    },
                                  },
                                  required: ['uri', 'name'],
                                  additionalProperties: false,
                                },
                                status: {
                                  type: 'string',
                                  enum: ['draft', 'ready', 'approved'],
                                  default: 'draft',
                                  description: 'The current review status.',
                                },
                                reviewers: {
                                  type: 'array',
                                  items: {
                                    type: 'object',
                                    properties: {
                                      user: {
                                        type: 'object',
                                        properties: {
                                          email: {
                                            type: 'string',
                                            nullable: true,
                                            default: null,
                                            description: 'The email address of the user who approved the branch.',
                                          },
                                          name: {
                                            type: 'string',
                                            nullable: true,
                                            default: null,
                                            description: 'The name of the user who approved the branch.',
                                          },
                                        },
                                        additionalProperties: false,
                                        description: 'Information about the user who approved the branch.',
                                      },
                                      action: {
                                        type: 'string',
                                        enum: ['approve', 'revoke'],
                                        description: 'The action taken by the user when the review was made.',
                                      },
                                      created_at: {
                                        type: 'string',
                                        format: 'date-time',
                                        description: 'An ISO 8601 formatted date for when the reviewer was created.',
                                      },
                                      updated_at: {
                                        type: 'string',
                                        format: 'date-time',
                                        nullable: true,
                                        default: null,
                                        description:
                                          'An ISO 8601 formatted date for when the reviewer was last updated.',
                                      },
                                    },
                                    required: ['user', 'action', 'created_at'],
                                    additionalProperties: false,
                                  },
                                  default: [],
                                  description: 'A list of reviewers.',
                                },
                                ready_at: {
                                  type: 'string',
                                  nullable: true,
                                  default: null,
                                  description: 'An ISO 8601 formatted date for when the review was set to ready.',
                                },
                                ready_by: {
                                  type: 'object',
                                  properties: {
                                    email: {
                                      type: 'string',
                                      nullable: true,
                                      default: null,
                                      description: 'User email who set the review to ready.',
                                    },
                                    name: {
                                      type: 'string',
                                      nullable: true,
                                      default: null,
                                      description: 'User name who set the review to ready.',
                                    },
                                  },
                                  additionalProperties: false,
                                  description: 'User who set the review to ready',
                                },
                                created_by: {
                                  type: 'object',
                                  properties: {
                                    email: {
                                      type: 'string',
                                      nullable: true,
                                      default: null,
                                      description: 'User email who created the branch.',
                                    },
                                    name: {
                                      type: 'string',
                                      nullable: true,
                                      default: null,
                                      description: 'User name who created the branch.',
                                    },
                                  },
                                  additionalProperties: false,
                                  description: 'User who created the branch.',
                                },
                                merged_at: {
                                  type: 'string',
                                  nullable: true,
                                  default: null,
                                  description: 'An ISO 8601 formatted date for when the branch was last merged.',
                                },
                                contributors: {
                                  type: 'array',
                                  items: {
                                    type: 'object',
                                    properties: {
                                      user: {
                                        type: 'object',
                                        properties: {
                                          email: {
                                            type: 'string',
                                            nullable: true,
                                            default: null,
                                            description: 'The email address of the user who contributed to the branch.',
                                          },
                                          name: {
                                            type: 'string',
                                            nullable: true,
                                            default: null,
                                            description: 'The email address of the user who contributed to the branch.',
                                          },
                                        },
                                        additionalProperties: false,
                                        description: 'Information about the user who contributed to the branch.',
                                      },
                                      updated_at: {
                                        type: 'string',
                                        format: 'date-time',
                                        nullable: true,
                                        default: null,
                                        description:
                                          'An ISO 8601 formatted date for when the contributor last updated.',
                                      },
                                    },
                                    required: ['user'],
                                    additionalProperties: false,
                                  },
                                  default: [],
                                  description: 'A list of contributors to the branch.',
                                },
                                tagged_reviewers: {
                                  type: 'array',
                                  items: {
                                    type: 'object',
                                    properties: {
                                      user: {
                                        type: 'object',
                                        properties: {
                                          email: {
                                            type: 'string',
                                            nullable: true,
                                            default: null,
                                            description: 'The email address of the tagged reviewer.',
                                          },
                                          name: {
                                            type: 'string',
                                            nullable: true,
                                            default: null,
                                            description: 'The name of the tagged reviewer.',
                                          },
                                        },
                                        additionalProperties: false,
                                        description: 'Information about the tagged reviewer.',
                                      },
                                      requested_at: {
                                        type: 'string',
                                        format: 'date-time',
                                        description: 'An ISO 8601 formatted date for when the reviewer was tagged.',
                                      },
                                      requested_by: {
                                        type: 'object',
                                        properties: {
                                          email: {
                                            type: 'string',
                                            nullable: true,
                                            default: null,
                                            description: 'The email address of the user who requested the review.',
                                          },
                                          name: {
                                            type: 'string',
                                            nullable: true,
                                            default: null,
                                            description: 'The name of the user who requested the review.',
                                          },
                                        },
                                        additionalProperties: false,
                                        description: 'The user who requested the review.',
                                      },
                                    },
                                    required: ['user', 'requested_at', 'requested_by'],
                                    additionalProperties: false,
                                  },
                                  default: [],
                                  description: 'A list of tagged reviewers for this branch.',
                                },
                                updated_at: {
                                  type: 'string',
                                  format: 'date-time',
                                  description: 'An ISO 8601 formatted date for when the review was last updated.',
                                },
                                report: {
                                  type: 'object',
                                  properties: {
                                    id: {
                                      type: 'string',
                                      nullable: true,
                                      default: null,
                                      description: 'A report id or matching job id.',
                                    },
                                  },
                                  additionalProperties: false,
                                  description: 'Information about the reporting job',
                                },
                                project: { type: 'string', description: 'The project ID that this review belongs to.' },
                                notification_settings: {
                                  type: 'object',
                                  properties: {
                                    branch_topic_key: {
                                      type: 'string',
                                      nullable: true,
                                      default: null,
                                      description:
                                        'The Novu Topic Key associated with this branch for managing notification subscriptions.',
                                    },
                                  },
                                  additionalProperties: false,
                                  description: 'Notification settings for the branch review.',
                                },
                              },
                              required: [
                                'branch',
                                'ready_by',
                                'created_by',
                                'updated_at',
                                'report',
                                'project',
                                'notification_settings',
                              ],
                              additionalProperties: false,
                              description: 'The review status to the branch resource.',
                            },
                          },
                          required: ['base', 'href', 'name', 'updated_at', 'uri', 'review'],
                          additionalProperties: false,
                        },
                        type: { type: 'string', enum: ['branch'] },
                      },
                      required: ['data', 'type'],
                      additionalProperties: false,
                    },
                  ],
                },
              },
            },
          },
        },
      },
      patch: {
        operationId: 'updateBranch',
        summary: 'Updates an existing branch',
        tags: ['Branches'],
        description:
          'Update an existing branch in your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                anyOf: [
                  {
                    type: 'object',
                    properties: {
                      display_name: { type: 'string', description: 'A non-semver display name for the version.' },
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
                            default: 'hidden',
                            description:
                              "Whether the version is public, hidden, or the stable version that's visible by default.",
                          },
                        },
                        additionalProperties: false,
                      },
                      release_stage: { type: 'string', enum: ['beta', 'release'], default: 'release' },
                      state: { type: 'string', enum: ['current', 'deprecated'], default: 'current' },
                    },
                    additionalProperties: false,
                  },
                  {
                    type: 'object',
                    properties: {
                      name: {
                        type: 'string',
                        pattern: '(v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?',
                        description: 'The target rename of the branch and its version prefix.',
                      },
                    },
                    required: ['name'],
                    additionalProperties: false,
                  },
                ],
                description:
                  'Dependent upon the type of resource you are updating this is the representation for a branch or version.',
              },
            },
          },
          description:
            'Dependent upon the type of resource you are updating this is the representation for a branch or version.',
        },
        parameters: [
          {
            schema: {
              type: 'string',
              pattern: '(v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?',
            },
            in: 'path',
            name: 'branch',
            required: true,
            description: "Project version number, `stable` for your project's stable version, or a valid branch name.",
          },
        ],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  anyOf: [
                    {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            base: {
                              type: 'string',
                              nullable: true,
                              description: 'The name of the version this version was based off of.',
                            },
                            display_name: {
                              type: 'string',
                              nullable: true,
                              description: 'A non-semver display name for the version.',
                            },
                            i18n: {
                              type: 'object',
                              properties: {
                                lang: { type: 'string', nullable: true, description: 'The language of the version.' },
                                parsed_version: {
                                  type: 'string',
                                  nullable: true,
                                  description: 'The parsed version without the language code.',
                                },
                              },
                              required: ['lang', 'parsed_version'],
                              additionalProperties: false,
                              description:
                                'Internationalization information for the version. This feature is gated and still in active development, so the values in this object will generally be set to `null`.',
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
                              description: 'Whether the version is released or in beta.',
                            },
                            source: {
                              type: 'string',
                              enum: ['readme', 'bidi'],
                              description: 'Whether the version was created in ReadMe or via Bi-Directional Sync.',
                            },
                            state: {
                              type: 'string',
                              enum: ['current', 'deprecated'],
                              description: 'Whether the version is current or deprecated.',
                            },
                            updated_at: {
                              type: 'string',
                              format: 'date-time',
                              description: 'An ISO 8601 formatted date for when the version was last updated.',
                            },
                            uri: {
                              type: 'string',
                              pattern:
                                '\\/branches\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)',
                              description: 'A URI to the version resource.',
                            },
                          },
                          required: [
                            'base',
                            'display_name',
                            'i18n',
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
                        type: { type: 'string', enum: ['version'] },
                      },
                      required: ['data', 'type'],
                      additionalProperties: false,
                    },
                    {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            base: {
                              type: 'object',
                              properties: {
                                base: {
                                  type: 'string',
                                  nullable: true,
                                  description: 'The name of the version this version was based off of.',
                                },
                                display_name: {
                                  type: 'string',
                                  nullable: true,
                                  description: 'A non-semver display name for the version.',
                                },
                                i18n: {
                                  type: 'object',
                                  properties: {
                                    lang: {
                                      type: 'string',
                                      nullable: true,
                                      description: 'The language of the version.',
                                    },
                                    parsed_version: {
                                      type: 'string',
                                      nullable: true,
                                      description: 'The parsed version without the language code.',
                                    },
                                  },
                                  required: ['lang', 'parsed_version'],
                                  additionalProperties: false,
                                  description:
                                    'Internationalization information for the version. This feature is gated and still in active development, so the values in this object will generally be set to `null`.',
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
                                  description: 'Whether the version is released or in beta.',
                                },
                                source: {
                                  type: 'string',
                                  enum: ['readme', 'bidi'],
                                  description: 'Whether the version was created in ReadMe or via Bi-Directional Sync.',
                                },
                                state: {
                                  type: 'string',
                                  enum: ['current', 'deprecated'],
                                  description: 'Whether the version is current or deprecated.',
                                },
                                updated_at: {
                                  type: 'string',
                                  format: 'date-time',
                                  description: 'An ISO 8601 formatted date for when the version was last updated.',
                                },
                                uri: {
                                  type: 'string',
                                  pattern:
                                    '\\/branches\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)',
                                  description: 'A URI to the version resource.',
                                },
                              },
                              required: [
                                'base',
                                'display_name',
                                'i18n',
                                'name',
                                'privacy',
                                'release_stage',
                                'source',
                                'state',
                                'updated_at',
                                'uri',
                              ],
                              additionalProperties: false,
                              description:
                                'The representation of the version the branch was created from or the stable version.',
                            },
                            href: {
                              type: 'object',
                              properties: {
                                external: {
                                  type: 'object',
                                  properties: {
                                    diff: {
                                      type: 'string',
                                      nullable: true,
                                      description:
                                        'A link to the external branch diff on bi-directionally synced projects.',
                                    },
                                    view: {
                                      type: 'string',
                                      nullable: true,
                                      description:
                                        'A link to view the external branch on bi-directionally synced projects.',
                                    },
                                  },
                                  required: ['diff', 'view'],
                                  additionalProperties: false,
                                },
                              },
                              required: ['external'],
                              additionalProperties: false,
                            },
                            name: {
                              type: 'string',
                              pattern: '(v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?',
                              description: 'The name of the branch and its version prefix.',
                            },
                            updated_at: {
                              type: 'string',
                              format: 'date-time',
                              description: 'An ISO 8601 formatted date for when the branch was last updated.',
                            },
                            uri: {
                              type: 'string',
                              pattern:
                                '\\/branches\\/((v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?)',
                              description: 'A URI to the branch resource.',
                            },
                            review: {
                              type: 'object',
                              properties: {
                                branch: {
                                  type: 'object',
                                  properties: {
                                    uri: {
                                      type: 'string',
                                      description:
                                        'A URI to the version or branch resource that this custom block belongs to.',
                                    },
                                    name: {
                                      type: 'string',
                                      description:
                                        'A friendly name automatically generated from your internal version number or branch name.',
                                    },
                                  },
                                  required: ['uri', 'name'],
                                  additionalProperties: false,
                                },
                                status: {
                                  type: 'string',
                                  enum: ['draft', 'ready', 'approved'],
                                  default: 'draft',
                                  description: 'The current review status.',
                                },
                                reviewers: {
                                  type: 'array',
                                  items: {
                                    type: 'object',
                                    properties: {
                                      user: {
                                        type: 'object',
                                        properties: {
                                          email: {
                                            type: 'string',
                                            nullable: true,
                                            default: null,
                                            description: 'The email address of the user who approved the branch.',
                                          },
                                          name: {
                                            type: 'string',
                                            nullable: true,
                                            default: null,
                                            description: 'The name of the user who approved the branch.',
                                          },
                                        },
                                        additionalProperties: false,
                                        description: 'Information about the user who approved the branch.',
                                      },
                                      action: {
                                        type: 'string',
                                        enum: ['approve', 'revoke'],
                                        description: 'The action taken by the user when the review was made.',
                                      },
                                      created_at: {
                                        type: 'string',
                                        format: 'date-time',
                                        description: 'An ISO 8601 formatted date for when the reviewer was created.',
                                      },
                                      updated_at: {
                                        type: 'string',
                                        format: 'date-time',
                                        nullable: true,
                                        default: null,
                                        description:
                                          'An ISO 8601 formatted date for when the reviewer was last updated.',
                                      },
                                    },
                                    required: ['user', 'action', 'created_at'],
                                    additionalProperties: false,
                                  },
                                  default: [],
                                  description: 'A list of reviewers.',
                                },
                                ready_at: {
                                  type: 'string',
                                  nullable: true,
                                  default: null,
                                  description: 'An ISO 8601 formatted date for when the review was set to ready.',
                                },
                                ready_by: {
                                  type: 'object',
                                  properties: {
                                    email: {
                                      type: 'string',
                                      nullable: true,
                                      default: null,
                                      description: 'User email who set the review to ready.',
                                    },
                                    name: {
                                      type: 'string',
                                      nullable: true,
                                      default: null,
                                      description: 'User name who set the review to ready.',
                                    },
                                  },
                                  additionalProperties: false,
                                  description: 'User who set the review to ready',
                                },
                                created_by: {
                                  type: 'object',
                                  properties: {
                                    email: {
                                      type: 'string',
                                      nullable: true,
                                      default: null,
                                      description: 'User email who created the branch.',
                                    },
                                    name: {
                                      type: 'string',
                                      nullable: true,
                                      default: null,
                                      description: 'User name who created the branch.',
                                    },
                                  },
                                  additionalProperties: false,
                                  description: 'User who created the branch.',
                                },
                                merged_at: {
                                  type: 'string',
                                  nullable: true,
                                  default: null,
                                  description: 'An ISO 8601 formatted date for when the branch was last merged.',
                                },
                                contributors: {
                                  type: 'array',
                                  items: {
                                    type: 'object',
                                    properties: {
                                      user: {
                                        type: 'object',
                                        properties: {
                                          email: {
                                            type: 'string',
                                            nullable: true,
                                            default: null,
                                            description: 'The email address of the user who contributed to the branch.',
                                          },
                                          name: {
                                            type: 'string',
                                            nullable: true,
                                            default: null,
                                            description: 'The email address of the user who contributed to the branch.',
                                          },
                                        },
                                        additionalProperties: false,
                                        description: 'Information about the user who contributed to the branch.',
                                      },
                                      updated_at: {
                                        type: 'string',
                                        format: 'date-time',
                                        nullable: true,
                                        default: null,
                                        description:
                                          'An ISO 8601 formatted date for when the contributor last updated.',
                                      },
                                    },
                                    required: ['user'],
                                    additionalProperties: false,
                                  },
                                  default: [],
                                  description: 'A list of contributors to the branch.',
                                },
                                tagged_reviewers: {
                                  type: 'array',
                                  items: {
                                    type: 'object',
                                    properties: {
                                      user: {
                                        type: 'object',
                                        properties: {
                                          email: {
                                            type: 'string',
                                            nullable: true,
                                            default: null,
                                            description: 'The email address of the tagged reviewer.',
                                          },
                                          name: {
                                            type: 'string',
                                            nullable: true,
                                            default: null,
                                            description: 'The name of the tagged reviewer.',
                                          },
                                        },
                                        additionalProperties: false,
                                        description: 'Information about the tagged reviewer.',
                                      },
                                      requested_at: {
                                        type: 'string',
                                        format: 'date-time',
                                        description: 'An ISO 8601 formatted date for when the reviewer was tagged.',
                                      },
                                      requested_by: {
                                        type: 'object',
                                        properties: {
                                          email: {
                                            type: 'string',
                                            nullable: true,
                                            default: null,
                                            description: 'The email address of the user who requested the review.',
                                          },
                                          name: {
                                            type: 'string',
                                            nullable: true,
                                            default: null,
                                            description: 'The name of the user who requested the review.',
                                          },
                                        },
                                        additionalProperties: false,
                                        description: 'The user who requested the review.',
                                      },
                                    },
                                    required: ['user', 'requested_at', 'requested_by'],
                                    additionalProperties: false,
                                  },
                                  default: [],
                                  description: 'A list of tagged reviewers for this branch.',
                                },
                                updated_at: {
                                  type: 'string',
                                  format: 'date-time',
                                  description: 'An ISO 8601 formatted date for when the review was last updated.',
                                },
                                report: {
                                  type: 'object',
                                  properties: {
                                    id: {
                                      type: 'string',
                                      nullable: true,
                                      default: null,
                                      description: 'A report id or matching job id.',
                                    },
                                  },
                                  additionalProperties: false,
                                  description: 'Information about the reporting job',
                                },
                                project: { type: 'string', description: 'The project ID that this review belongs to.' },
                                notification_settings: {
                                  type: 'object',
                                  properties: {
                                    branch_topic_key: {
                                      type: 'string',
                                      nullable: true,
                                      default: null,
                                      description:
                                        'The Novu Topic Key associated with this branch for managing notification subscriptions.',
                                    },
                                  },
                                  additionalProperties: false,
                                  description: 'Notification settings for the branch review.',
                                },
                              },
                              required: [
                                'branch',
                                'ready_by',
                                'created_by',
                                'updated_at',
                                'report',
                                'project',
                                'notification_settings',
                              ],
                              additionalProperties: false,
                              description: 'The review status to the branch resource.',
                            },
                          },
                          required: ['base', 'href', 'name', 'updated_at', 'uri', 'review'],
                          additionalProperties: false,
                        },
                        type: { type: 'string', enum: ['branch'] },
                      },
                      required: ['data', 'type'],
                      additionalProperties: false,
                    },
                  ],
                },
              },
            },
          },
        },
      },
      delete: {
        operationId: 'deleteBranch',
        summary: 'Delete a branch',
        tags: ['Branches'],
        description:
          'Delete a branch from your ReadMe project.\n\n>📘\n> This route is only available to projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).',
        parameters: [
          {
            schema: {
              type: 'string',
              pattern: '(v{0,1})(stable|([0-9]+)(?:\\.([0-9]+))?(?:\\.([0-9]+))?(-.*)?)(_(.*))?',
            },
            in: 'path',
            name: 'branch',
            required: true,
            description: "Project version number, `stable` for your project's stable version, or a valid branch name.",
          },
        ],
        responses: { '204': { description: 'No Content' } },
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
    { name: 'Apply to ReadMe' },
    { name: 'Branches' },
    { name: 'Categories' },
    { name: 'Changelog' },
    { name: 'Custom Pages' },
    { name: 'Discuss' },
    { name: 'Fonts' },
    { name: 'Guides' },
    { name: 'Images' },
    { name: 'IP Addresses' },
    { name: 'Owlbot AI' },
    { name: 'Projects' },
    { name: 'Recipes' },
    { name: 'Search' },
  ],
} as const satisfies OASDocument & { info: { 'x-readme-deploy': string } };

export default document;
