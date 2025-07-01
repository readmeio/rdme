import BaseCommand from '../../lib/baseCommand.js';
import { branchFlag, keyFlag } from '../../lib/flags.js';
import { args, description, examples, baseFlags, summary, alphaNotice } from '../../lib/pageCommandProperties.js';
import syncPagePath, { type FullUploadResults } from '../../lib/syncPagePath.js';

export default class DocsUploadCommand extends BaseCommand<typeof DocsUploadCommand> {
  id = 'docs upload' as const;

  route = 'guides' as const;

  static section = 'Guides' as const;

  static hidden = true;

  static summary = summary(this.section);

  static description = description(this.section);

  static args = args(this.section);

  static examples = examples(this.section);

  static flags = { key: keyFlag, ...branchFlag(), ...baseFlags(this.section) };

  async run(): Promise<FullUploadResults> {
    if (!this.flags['hide-experimental-warning']) {
      this.warn(alphaNotice);
    }
    return syncPagePath.call(this);
  }
}
