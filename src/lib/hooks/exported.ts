import type { PageMetadata } from '../readPage.js';
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
    /**
     * The list of pages that will be validated and written to the output directory.
     */
    return: PageMetadata[];
  };
}
