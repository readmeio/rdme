import type { CommandOptions } from '../../lib/baseCommand';

import chalk from 'chalk';
import config from 'config';

import Command, { CommandCategories } from '../../lib/baseCommand';
import deleteDoc from '../../lib/deleteDoc';
import getDocs from '../../lib/getDocs';
import getSlug from '../../lib/getSlug';
import pushDoc from '../../lib/pushDoc';
import readdirRecursive from '../../lib/readdirRecursive';
import { getProjectVersion } from '../../lib/versionSelect';

export type Options = {
  dryRun?: boolean;
  folder?: string;
  deleteMissing?: boolean;
};

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
      {
        name: 'key',
        type: String,
        description: 'Project API key',
      },
      this.getVersionArg(),
      {
        name: 'folder',
        type: String,
        defaultOption: true,
      },
      {
        name: 'dryRun',
        type: Boolean,
        description: 'Runs the command without creating/updating any docs in ReadMe. Useful for debugging.',
      },
      {
        name: 'deleteMissing',
        type: Boolean,
        description: "Delete a doc from ReadMe if its slug can't be found in the target folder.",
      },
    ];
  }

  async run(opts: CommandOptions<Options>) {
    super.run(opts);

    const { dryRun, folder, key, version, deleteMissing } = opts;

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
    if (deleteMissing) {
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
    return chalk.green(changes.join('\n'));
  }
}
