import type { Glossary } from '../../lib/glossary.js';

import fs from 'node:fs/promises';
import path from 'node:path';

import { Args, Flags } from '@oclif/core';

import BaseCommand from '../../lib/baseCommand.js';
import { keyFlag } from '../../lib/flags.js';

export default class GlossaryExportCommand extends BaseCommand<typeof GlossaryExportCommand> {
  id = 'glossary export' as const;

  static summary = 'Export glossary terms from your ReadMe project to a JSON file.';

  static description = [
    'Exports project terms by default and writes them to a `terms` list, ready for `<%= config.bin %> glossary upload`. The destination file is overwritten if it already exists.',
    'Use `--include-group` to also export terms inherited from an Enterprise group in a separate `group_terms` list. Only applicable to projects within an Enterprise group.',
    '`group_terms` is omitted when group terms are not requested or the project has no Enterprise group.',
    'Within each list, the first occurrence of a name is retained, ignoring case and surrounding whitespace. Matching names in the two lists are preserved.',
  ].join('\n\n');

  static args = {
    file: Args.string({ description: 'JSON file to write the exported glossary to.', required: true }),
  };

  static flags = {
    key: keyFlag,
    'include-group': Flags.boolean({
      description:
        'Include terms inherited from the project’s Enterprise group in a separate `group_terms` list. Only applicable to projects within an Enterprise group.',
    }),
  };

  static examples = [
    {
      description: 'Export project terms to a JSON file:',
      command: '<%= config.bin %> <%= command.id %> glossary.json',
    },
    {
      description: 'Also export terms inherited from your Enterprise group:',
      command: '<%= config.bin %> <%= command.id %> glossary.json --include-group',
    },
  ];

  async run() {
    const query = this.flags['include-group'] ? '?include_group=true' : '';
    const response = await this.readmeAPIFetch(`/projects/me/glossary${query}`, {
      headers: { authorization: `Bearer ${this.flags.key}` },
    });
    const { data } = await this.handleAPIRes<{ data: Glossary }>(response);
    const glossary = { terms: data.terms, ...(data.group_terms !== null ? { group_terms: data.group_terms } : {}) };

    await fs.mkdir(path.dirname(this.args.file), { recursive: true });
    await fs.writeFile(this.args.file, `${JSON.stringify(glossary, null, 2)}\n`, 'utf8');
    this.info(
      `Exported ${data.terms.length} project terms${data.group_terms ? ` and ${data.group_terms.length} group terms` : ''} to ${this.args.file}.`,
    );
    return glossary;
  }
}
