import type { CommandOptions } from '../../lib/baseCommand';

import chalk from 'chalk';
import config from 'config';

import Command, { CommandCategories } from '../../lib/baseCommand';
import createGHA from '../../lib/createGHA';
import deleteDoc from '../../lib/deleteDoc';
import getDocs from '../../lib/getDocs';
import promptTerminal from '../../lib/promptWrapper';
import readdirRecursive from '../../lib/readdirRecursive';
import readDoc from '../../lib/readDoc';
import { getProjectVersion } from '../../lib/versionSelect';

export type Options = {
  dryRun?: boolean;
  folder?: string;
};

function getSlug(filename: string): string {
  const { slug } = readDoc(filename);
  return slug;
}

export default class DocsPruneCommand extends Command {
  constructor() {
    super();

    this.command = 'docs:prune';
    this.usage = 'docs:prune <folder> [options]';
    this.description = 'Delete any docs from ReadMe if their slugs are not found in the target folder.';
    this.cmdCategory = CommandCategories.DOCS;
    this.position = 2;

    this.hiddenArgs = ['folder'];
    this.args = [
      this.getKeyArg(),
      this.getVersionArg(),
      {
        name: 'folder',
        type: String,
        defaultOption: true,
      },
      this.getGitHubArg(),
      {
        name: 'dryRun',
        type: Boolean,
        description: 'Runs the command without creating/updating any docs in ReadMe. Useful for debugging.',
      },
    ];
  }

  async run(opts: CommandOptions<Options>) {
    await super.run(opts);

    const { dryRun, folder, key, version } = opts;

    if (!folder) {
      return Promise.reject(new Error(`No folder provided. Usage \`${config.get('cli')} ${this.usage}\`.`));
    }

    // TODO: should we allow version selection at all here?
    // Let's revisit this once we re-evaluate our category logic in the API.
    // Ideally we should ignore this parameter entirely if the category is included.
    const selectedVersion = await getProjectVersion(version, key);

    Command.debug(`selectedVersion: ${selectedVersion}`);

    // Strip out non-markdown files
    const files = readdirRecursive(folder).filter(
      file => file.toLowerCase().endsWith('.md') || file.toLowerCase().endsWith('.markdown')
    );

    Command.debug(`number of files: ${files.length}`);

    if (!files.length) {
      const { deleteAll } = await promptTerminal({
        type: 'confirm',
        name: 'deleteAll',
        message: `This action will delete all docs under version ${selectedVersion} from ReadMe, would you like to continue?`,
      });

      if (!deleteAll) {
        return Promise.reject(new Error('Aborting, no changes were made.'));
      }
    }

    Command.warn(`We're going to delete from ReadMe any document that isn't found in ${folder}.`);

    const docs = await getDocs(key, selectedVersion);
    const docSlugs = docs.map(({ slug }: { slug: string }) => slug);
    const fileSlugs = new Set(files.map(getSlug));
    const slugsToDelete = docSlugs.filter((slug: string) => !fileSlugs.has(slug));
    const deletedDocs = await Promise.all(
      slugsToDelete.map((slug: string) => deleteDoc(key, selectedVersion, dryRun, slug, this.cmdCategory))
    );

    return Promise.resolve(chalk.green(deletedDocs.join('\n'))).then(msg =>
      createGHA(msg, this.command, this.args, { ...opts, version: selectedVersion })
    );
  }
}
