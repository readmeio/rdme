import { Args, Flags } from '@oclif/core';
import chalk from 'chalk';
import prompts from 'prompts';

import BaseCommand from '../../lib/baseCommand.js';
import deleteDoc from '../../lib/deleteDoc.js';
import { githubFlag, keyFlag, versionFlag } from '../../lib/flags.js';
import getDocs from '../../lib/getDocs.js';
import promptTerminal from '../../lib/promptWrapper.js';
import readdirRecursive from '../../lib/readdirRecursive.js';
import readDoc from '../../lib/readDoc.js';
import { getProjectVersion } from '../../lib/versionSelect.js';

function getSlug(filename: string): string {
  const { slug } = readDoc(filename);
  return slug;
}

export default class DocsPruneCommand extends BaseCommand<typeof DocsPruneCommand> {
  static aliases = ['guides:prune'];

  static description = 'Delete any docs from ReadMe if their slugs are not found in the target folder.';

  static args = {
    folder: Args.string({ description: 'A local folder containing the files you wish to prune.', required: true }),
  };

  static flags = {
    key: keyFlag,
    version: versionFlag,
    github: githubFlag,
    confirm: Flags.boolean({
      description: 'Bypass the confirmation prompt. Useful for CI environments.',
    }),
    dryRun: Flags.boolean({
      description: 'Runs the command without deleting any docs in ReadMe. Useful for debugging.',
    }),
  };

  async run() {
    const { folder } = this.args;
    const { dryRun, key, version } = this.flags;

    // TODO: should we allow version selection at all here?
    // Let's revisit this once we re-evaluate our category logic in the API.
    // Ideally we should ignore this parameter entirely if the category is included.
    const selectedVersion = await getProjectVersion(version, key);

    this.debug(`selectedVersion: ${selectedVersion}`);

    // Strip out non-markdown files
    const files = readdirRecursive(folder).filter(
      file => file.toLowerCase().endsWith('.md') || file.toLowerCase().endsWith('.markdown'),
    );

    this.debug(`number of files: ${files.length}`);

    prompts.override({ confirm: this.flags.confirm });

    const { confirm } = await promptTerminal({
      type: 'confirm',
      name: 'confirm',
      message: `This command will delete all guides page from your ReadMe project (version ${selectedVersion}) that are not also in ${folder}, would you like to confirm?`,
    });

    if (!confirm) {
      return Promise.reject(new Error('Aborting, no changes were made.'));
    }

    const docs = await getDocs(key, selectedVersion);
    const docSlugs = docs.map(({ slug }: { slug: string }) => slug);
    const fileSlugs = new Set(files.map(getSlug));
    const slugsToDelete = docSlugs.filter((slug: string) => !fileSlugs.has(slug));
    const deletedDocs = await Promise.all(
      slugsToDelete.map((slug: string) => deleteDoc(key, selectedVersion, dryRun, slug)),
    );

    return this.runCreateGHAHook({
      result: chalk.green(deletedDocs.join('\n')),
      parsedOpts: { ...this.args, ...this.flags, version: selectedVersion, confirm: true },
    });
  }
}
