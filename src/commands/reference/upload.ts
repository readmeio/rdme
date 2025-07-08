import BaseCommand from '../../lib/baseCommand.js';
import { branchFlag, keyFlag } from '../../lib/flags.js';
import { args, baseFlags, description, examples, summary } from '../../lib/pageCommandProperties.js';
import syncPagePath, { type FullUploadResults } from '../../lib/syncPagePath.js';

export default class RefUploadCommand extends BaseCommand<typeof RefUploadCommand> {
  id = 'reference upload' as const;

  route = 'reference' as const;

  static section = 'Reference' as const;

  static summary = summary(this.section);

  static description = description(this.section);

  static args = args(this.section);

  static examples = examples(this.section);

  static flags = { key: keyFlag, ...branchFlag(), ...baseFlags(this.section) };

  async run(): Promise<FullUploadResults> {
    return syncPagePath.call(this);
  }
}
