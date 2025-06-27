import type { PageRequestSchema, PageResponseSchema } from './lib/types/index.js';

export type {
  APIKeyRepresentation,
  PageRequestSchema,
  PageResponseSchema,
  ProjectRepresentation,
} from './lib/types/index.js';
export type { PageMetadata } from './lib/readPage.js';
export type {
  MarkdownFileScanResultOpts,
  MigrationStats,
  PluginHooks,
  PluginMigrationStats,
  FailedUploadStatus,
  CreateUploadStatus,
  UpdateUploadStatus,
  UploadStatus,
} from './lib/hooks/exported.js';
export type { ResponseBody } from './lib/readmeAPIFetch.js';

/**
 * @deprecated use `PageRequestSchema` instead.
 */
export type GuidesRequestRepresentation = PageRequestSchema<'guides'>;

/**
 * @deprecated use `PageRequestSchema` instead.
 */
export type GuidesResponseRepresentation = PageResponseSchema<'guides'>;
