import type { FullExportResults } from '../../lib/exportDocs.js';

import BaseCommand from '../../lib/baseCommand.js';
import { args, summary, description, examples, flags } from '../../lib/exportCommandProperties.js';
import { exportDocs } from '../../lib/exportDocs.js';

export default class ReferenceExportCommand extends BaseCommand<typeof ReferenceExportCommand> {
  id = 'reference export' as const;

  route = 'reference' as const;

  static section = 'Reference' as const;

  static summary = summary(this.section);

  static description = description(this.section, 'reference');

  static args = args(this.section);

  static flags = flags(this.section);

  static examples = examples(this.section);

  async run(): Promise<FullExportResults> {
    return exportDocs.call(this);
  }
}
