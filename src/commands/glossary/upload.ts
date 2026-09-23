import type { Glossary, GlossaryUploadResponse } from '../../lib/glossary.js';

import fs from 'node:fs/promises';

import { Args, Flags } from '@oclif/core';

import BaseCommand from '../../lib/baseCommand.js';
import { keyFlag } from '../../lib/flags.js';
import { parseGlossary, previewGlossary } from '../../lib/glossary.js';
import { isRecord } from '../../utils.js';

export default class GlossaryUploadCommand extends BaseCommand<typeof GlossaryUploadCommand> {
  id = 'glossary upload' as const;

  static summary = 'Upload glossary terms to your ReadMe project from a JSON file.';

  static description = [
    'The JSON file must contain a `terms` array of objects with non-empty `term` and `definition` strings. For example: `{ "terms": [{ "term": "API", "definition": "Application programming interface" }] }`.',
    'By default, matching project terms are updated in place, omitted terms are retained, and new terms are added at the top in file order. Names are matched ignoring case and surrounding whitespace; the first occurrence in the file wins.',
    'Use `--replace` to replace all project terms, or `{ "terms": [] }` with `--replace` to clear them. Use `--dry-run` to preview the resulting project terms without saving changes.',
    '`group_terms` from an export is ignored; only project terms are uploaded.',
  ].join('\n\n');

  static args = {
    file: Args.string({ description: 'JSON file containing glossary terms to upload.', required: true }),
  };

  static flags = {
    key: keyFlag,
    'dry-run': Flags.boolean({ description: 'Preview the resulting project terms without saving changes.' }),
    replace: Flags.boolean({ description: 'Replace all project terms instead of merging.' }),
  };

  static examples = [
    {
      description: 'Merge terms from a JSON file into your project glossary:',
      command: '<%= config.bin %> <%= command.id %> glossary.json',
    },
    {
      description: 'Preview the resulting project terms without saving changes:',
      command: '<%= config.bin %> <%= command.id %> glossary.json --dry-run',
    },
    {
      description: 'Replace all project terms with the terms in the file:',
      command: '<%= config.bin %> <%= command.id %> glossary.json --replace',
    },
  ];

  async run() {
    const source = await fs.readFile(this.args.file, 'utf8');
    let input: unknown;
    try {
      input = JSON.parse(source);
    } catch {
      throw new Error(`Unable to parse ${this.args.file}: expected a valid JSON glossary file.`);
    }

    const glossary = parseGlossary(input);
    if (isRecord(input) && input.group_terms != null) {
      this.warn('Ignoring group_terms. Only project terms are uploaded.');
    }
    const headers = { authorization: `Bearer ${this.flags.key}`, 'Content-Type': 'application/json' };
    const replace = this.flags.replace ?? false;

    if (this.flags['dry-run']) {
      const response = await this.readmeAPIFetch('/projects/me/glossary', { headers });
      const { data } = await this.handleAPIRes<{ data: Glossary }>(response);
      const terms = previewGlossary(data.terms, glossary.terms, replace);
      this.info(`Dry run: would ${replace ? 'replace' : 'merge'} project glossary terms. No changes saved.`);
      this.log(JSON.stringify({ terms }, null, 2));
      return { data: { terms }, dry_run: true };
    }

    const response = await this.readmeAPIFetch(
      '/projects/me/glossary',
      {
        method: replace ? 'PUT' : 'PATCH',
        headers,
        body: JSON.stringify({ terms: glossary.terms }),
      },
      { file: { path: this.args.file, type: 'path' } },
    );
    const result = await this.handleAPIRes<GlossaryUploadResponse>(response);
    const { added, updated, removed, duplicates_ignored: duplicates } = result.data.changes;
    this.info(
      `Glossary uploaded: ${added} added, ${updated} updated, ${removed} removed, ${duplicates} duplicate entries ignored.`,
    );
    return result;
  }
}
