import BaseCommand from '../../lib/baseCommand.js';
import { keyFlag } from '../../lib/flags.js';
import { args, baseFlags, description, examples, summary } from '../../lib/pageCommandProperties.js';
import syncPagePath, { type FullUploadResults } from '../../lib/syncPagePath.js';

export default class ChangelogUploadCommand extends BaseCommand<typeof ChangelogUploadCommand> {
  id = 'changelog upload' as const;

  route = 'changelogs' as const;

  static section = 'Changelog' as const;

  static summary = summary(this.section);

  static description = description(this.section);

  static args = args(this.section);

  static examples = examples(this.section);

  static flags = { key: keyFlag, ...baseFlags(this.section) };

  async run(): Promise<FullUploadResults> {
    return syncPagePath.call(this);
  }
}
