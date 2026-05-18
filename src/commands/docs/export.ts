import type { FullExportResults } from '../../lib/exportDocs.js';

import BaseCommand from '../../lib/baseCommand.js';
import { args, summary, description, examples, flags } from '../../lib/exportCommandProperties.js';
import { exportDocs } from '../../lib/exportDocs.js';

export default class DocsExportCommand extends BaseCommand<typeof DocsExportCommand> {
  id = 'docs export' as const;

  route = 'guides' as const;

  static section = 'Guides' as const;

  static summary = summary(this.section);

  static description = description(this.section, 'docs');

  static args = args(this.section);

  static flags = flags(this.section);

  static examples = examples(this.section);

  async run(): Promise<FullExportResults> {
    return exportDocs.call(this);
  }
}
