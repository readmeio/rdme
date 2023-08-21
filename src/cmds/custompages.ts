import type { CommandOptions } from '../lib/baseCommand';

import Command, { CommandCategories } from '../lib/baseCommand';
import supportsGHA from '../lib/decorators/supportsGHA';
import syncDocsPath from '../lib/syncDocsPath';

interface Options {
  dryRun?: boolean;
  filePath?: string;
}

@supportsGHA
export default class CustomPagesCommand extends Command {
  constructor() {
    super();

    this.command = 'custompages';
    this.usage = 'custompages <path> [options]';
    this.description =
      'Sync Markdown/HTML files to your ReadMe project as Custom Pages. Can either be a path to a directory or a single Markdown/HTML file.';
    this.cmdCategory = CommandCategories.CUSTOM_PAGES;

    this.hiddenArgs = ['filePath'];
    this.args = [
      this.getKeyArg(),
      {
        name: 'filePath',
        type: String,
        defaultOption: true,
      },
      this.getGitHubArg(),
      {
        name: 'dryRun',
        type: Boolean,
        description: 'Runs the command without creating/updating any custom pages in ReadMe. Useful for debugging.',
      },
    ];
  }

  async run(opts: CommandOptions<Options>) {
    await super.run(opts);

    const { dryRun, filePath, key } = opts;

    return syncDocsPath(key, undefined, this.cmdCategory, this.usage, filePath, dryRun, ['.html', '.markdown', '.md']);
  }
}
