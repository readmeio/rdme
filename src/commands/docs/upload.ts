import BaseCommand from '../../lib/baseCommand.js';
import { branchFlag, keyFlag } from '../../lib/flags.js';
import { args, description, examples, baseFlags, summary } from '../../lib/pageCommandProperties.js';
import syncPagePath, { type FullUploadResults } from '../../lib/syncPagePath.js';

export default class DocsUploadCommand extends BaseCommand<typeof DocsUploadCommand> {
  id = 'docs upload' as const;

  route = 'guides' as const;

  static section = 'Guides' as const;

  static summary = summary(this.section);

  static description = description(this.section);

  static args = args(this.section);

  static examples = examples(this.section);

  static flags = { key: keyFlag, ...branchFlag(), ...baseFlags(this.section) };

  async run(): Promise<FullUploadResults> {
    return syncPagePath.call(this);
  }
}
