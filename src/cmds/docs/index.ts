import type { CommandOptions } from '../../lib/baseCommand';

import chalk from 'chalk';
import config from 'config';

import Command, { CommandCategories } from '../../lib/baseCommand';
import createGHA from '../../lib/createGHA';
import deleteDoc from '../../lib/deleteDoc';
import getDocs from '../../lib/getDocs';
import * as promptHandler from '../../lib/prompts';
import promptTerminal from '../../lib/promptWrapper';
import pushDoc from '../../lib/pushDoc';
import readdirRecursive from '../../lib/readdirRecursive';
import readDoc from '../../lib/readDoc';
import { getProjectVersion } from '../../lib/versionSelect';

export type Options = {
  dryRun?: boolean;
  folder?: string;
  cleanup?: boolean;
};

function getSlug(filename: string): string {
  const { slug } = readDoc(filename);
  return slug;
}

export default class DocsCommand extends Command {
  constructor() {
    super();

    this.command = 'docs';
    this.usage = 'docs <folder> [options]';
    this.description = 'Sync a folder of Markdown files to your ReadMe project.';
    this.cmdCategory = CommandCategories.DOCS;
    this.position = 1;

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
      {
        name: 'cleanup',
        type: Boolean,
        description: 'Delete any docs from ReadMe if their slugs are not found in the target folder.',
      },
    ];
  }

  async run(opts: CommandOptions<Options>) {
    super.run(opts);

    const { dryRun, folder, key, version, cleanup } = opts;

    if (!folder) {
      return Promise.reject(new Error(`No folder provided. Usage \`${config.get('cli')} ${this.usage}\`.`));
    }

    // TODO: should we allow version selection at all here?
    // Let's revisit this once we re-evaluate our category logic in the API.
    // Ideally we should ignore this parameter entirely if the category is included.
    const selectedVersion = await getProjectVersion(version, key, false);

    Command.debug(`selectedVersion: ${selectedVersion}`);

    // Strip out non-markdown files
    const files = readdirRecursive(folder).filter(
      file => file.toLowerCase().endsWith('.md') || file.toLowerCase().endsWith('.markdown')
    );

    Command.debug(`number of files: ${files.length}`);

    const changes: string[] = [];
    if (cleanup) {
      if (!files.length) {
        const { deleteAll } = await promptTerminal(promptHandler.deleteDocsPrompt(selectedVersion));
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
      changes.push(...deletedDocs);
    } else if (!files.length) {
      return Promise.reject(new Error(`We were unable to locate Markdown files in ${folder}.`));
    }

    const updatedDocs = await Promise.all(
      files.map(async filename => {
        return pushDoc(key, selectedVersion, dryRun, filename, this.cmdCategory);
      })
    );
    changes.push(...updatedDocs);
    return Promise.resolve(chalk.green(changes.join('\n'))).then(msg =>
      createGHA(msg, this.command, this.args, { ...opts, version: selectedVersion })
    );
  }
}
