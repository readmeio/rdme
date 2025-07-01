import BaseCommand from '../../lib/baseCommand.js';
import { keyFlag } from '../../lib/flags.js';
import { args, baseFlags, description, examples, summary } from '../../lib/pageCommandProperties.js';
import syncPagePath, { type FullUploadResults } from '../../lib/syncPagePath.js';

const alphaNotice = 'This command is in an experimental alpha and is likely to change. Use at your own risk!';

export default class ChangelogUploadCommand extends BaseCommand<typeof ChangelogUploadCommand> {
  id = 'changelog upload' as const;

  route = 'changelogs' as const;

  static section = 'Changelog' as const;

  static hidden = true;

  static summary = summary(this.section);

  static description = description(this.section);

  static args = args(this.section);

  static examples = examples(this.section);

  static flags = { key: keyFlag, ...baseFlags(this.section) };

  async run(): Promise<FullUploadResults> {
    if (!this.flags['hide-experimental-warning']) {
      this.warn(alphaNotice);
    }
    return syncPagePath.call(this);
  }
}
