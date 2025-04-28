import type { PageMetadata } from '../readPage.js';
import type { PushResult } from '../syncPagePath.js';
import type { GuidesResponseRepresentation } from '../types/index.js';
import type { Hooks } from '@oclif/core/interfaces';

interface MarkdownFileScanResultOptsBase {
  // required for the oclif hook types
  [key: string]: unknown;
  /**
   * The path to the input file or directory as passed to the command line.
   */
  pathInput: string;
  /**
   * Whether or not the path input is a zip file.
   */
  zipped: boolean;
}

interface MarkdownFileScanResultOptsZipped extends MarkdownFileScanResultOptsBase {
  /**
   * The path to the temporary directory where the zip file was unzipped.
   * This is only present if the input file was a zip file.
   */
  unzippedDir: string;
  zipped: true;
}

interface MarkdownFileScanResultOptsUnzipped extends MarkdownFileScanResultOptsBase {
  zipped: false;
}

/**
 * The options passed to the `pre_markdown_file_scan` hook.
 */
export type MarkdownFileScanResultOpts = MarkdownFileScanResultOptsUnzipped | MarkdownFileScanResultOptsZipped;

interface BaseUploadStatus {
  /**
   * The status of the upload.
   */
  status: PushResult['result'];
}

export interface FailedUploadStatus extends BaseUploadStatus {
  /**
   * The error message if the upload failed.
   */
  error?: string;

  status: 'failed';
}

interface BaseSuccessUploadStatus extends BaseUploadStatus {
  /**
   * Upon upload, there a validation to determine if the page content is renderable or not.
   * This is the result of that validation.
   *
   * - `status`: A flag for if the resource is renderable or not.
   * - `error`: The rendering error. This is only present if the validation failed.
   * - `message`: Additional details about the rendering error. This is only present if the validation failed.
   */
  renderable: GuidesResponseRepresentation['data']['renderable'];

  /**
   * The full URL in ReadMe. Only present if the upload was successful.
   */
  url: string;
}

export interface CreateUploadStatus extends BaseSuccessUploadStatus {
  status: 'created';
}

export interface UpdateUploadStatus extends BaseSuccessUploadStatus {
  status: 'updated';
}

export type UploadStatus = BaseUploadStatus | CreateUploadStatus | FailedUploadStatus | UpdateUploadStatus;

interface BasePageStat {
  /**
   * The path to the output page file. Relative to the migration output directory.
   *
   * @example docs/support/index.md
   */
  outputPath: string;

  /**
   * The page slug in ReadMe.
   */
  slug: string;

  /**
   * The title of the page.
   */
  title: string;

  /**
   * The type of page for the sake of migration.
   * - `empty-parent`: A parent page with no body content. These are generally placeholders used for defining the hierarchy of the docs.
   * - `link`: A page that links to an external URL. These are generally used for linking to external documentation.
   * - `migrated`: A page that was migrated from the input directory. This migration workflow generally relies on a configuration file
   *  to define the hierarchy of the docs, so this means that the page was defined in the configuration file and was found in the input directory.
   * - `unlisted`: This means that the page was found in the input directory but was **not** defined in the configuration file.
   *  These will generally be uploaded to as hidden pages in their own category.
   */
  type: 'empty-parent' | 'link' | 'migrated' | 'unlisted';

  /**
   * The status of the upload. If `undefined`, the upload has not started yet.
   */
  upload?: UploadStatus;
}

interface LinkPageStat extends BasePageStat {
  /**
   * The external link URL.
   */
  linkUrl: string;

  type: 'link';
}

interface LocalPageStat extends BasePageStat {
  /**
   * The local path to the input page file. Relative to the root of the input directory/zip.
   *
   * This is very likely to be the same as the `outputPath` but is included for
   * completeness and to allow for the possibility of the output path being different.
   *
   * @example docs/support/index.md
   */
  inputPath: string;

  type: 'migrated' | 'unlisted';
}

type PageStat = BasePageStat | LinkPageStat | LocalPageStat;

/**
 * A subset of the full migration stats that are returned by a single plugin.
 */
export interface PluginMigrationStats {
  pages: PageStat[];
}

export interface MigrationStats {
  /**
   * The directory where the migration output assets are saved to.
   */
  migrationOutputDir: string;

  /**
   * A map where the key is the plugin name and the value is the migration stats object for that plugin.
   */
  results: Record<
    /**
     * The plugin that was run.
     */
    string,
    PluginMigrationStats
  >;

  /**
   * The ISO-formatted date string of when the migration was run.
   */
  timestamp: string;

  /**
   * The directory where the input was unzipped to. This is only present if the input was a zip file.
   */
  unzippedAssetsDir?: string;
}

/**
 * Hooks for usage in `rdme` plugins that invoke the `docs migrate` command.
 *
 * @note These hooks are under active development for internal usage and are subject to change.
 */
export interface PluginHooks extends Hooks {
  /**
   * This hook is called before the Markdown files are searched for with the path input argument.
   * If the path input is a zip file, it will be unzipped to a temporary directory.
   *
   * It can be used to modify the path input to point to a different directory or file.
   *
   * For example, say the user wants to upload a zip file. This hook can be used to
   * set the working directory to a subdirectory within the unzipped contents.
   */
  pre_markdown_file_scan: {
    options: MarkdownFileScanResultOpts;

    /**
     * The new directory to scan for Markdown files. If `null` is returned,
     * this means the original path input will be used.
     */
    return: string | null;
  };

  /**
   * This hook is called after the Markdown files are scanned and before they are validated.
   * It can be used to modify the list of pages that will be validated.
   *
   * For example, this hook can be used to add or remove pages
   * (or to modify the content/frontmatter of an existing page)
   * from the list of pages that were found in the input directory.
   */
  pre_markdown_validation: {
    options: {
      /**
       * The list of pages that were found in the input directory.
       */
      pages: PageMetadata[];
    };
    return: {
      /**
       * The list of pages that will be validated and written to the output directory.
       */
      pages: PageMetadata[];
      /**
       * Reporting stats on the migration process.
       */
      stats: PluginMigrationStats;
    };
  };
}
