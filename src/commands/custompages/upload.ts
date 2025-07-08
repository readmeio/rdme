import BaseCommand from '../../lib/baseCommand.js';
import { branchFlag, keyFlag } from '../../lib/flags.js';
import { args, baseFlags, description, examples, summary } from '../../lib/pageCommandProperties.js';
import syncPagePath, { type FullUploadResults } from '../../lib/syncPagePath.js';

export default class CustomPagesUploadCommand extends BaseCommand<typeof CustomPagesUploadCommand> {
  id = 'custompages upload' as const;

  route = 'custom_pages' as const;

  static section = 'Custom Pages' as const;

  static summary = summary(this.section);

  static description = description(this.section);

  static args = args(this.section);

  static examples = examples(this.section);

  static flags = { key: keyFlag, ...branchFlag(), ...baseFlags(this.section) };

  async run(): Promise<FullUploadResults> {
    return syncPagePath.call(this);
  }
}
