import type { PageMetadata } from '../readPage.js';
import type { Hooks } from '@oclif/core/interfaces';

/**
 * @note These hooks are under active development for internal usage and are subject to change.
 */
export interface PluginHooks extends Hooks {
  pre_markdown_file_scan: {
    options: {
      pathInput: string;
    };
    return: string | null;
  };
  pre_markdown_validation: {
    options: {
      pages: PageMetadata[];
    };
    return: PageMetadata[];
  };
}
