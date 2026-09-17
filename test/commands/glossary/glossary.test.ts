import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import nock from 'nock';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import ExportCommand from '../../../src/commands/glossary/export.js';
import UploadCommand from '../../../src/commands/glossary/upload.js';
import { getAPIv2Mock } from '../../helpers/get-api-mock.js';
import { runCommand } from '../../helpers/oclif.js';

const key = 'rdme_123';
const headers = { authorization: `Bearer ${key}` };
const endpoint = '/projects/me/glossary';
const a = { term: 'A', definition: 'First' };
const b = { term: 'B', definition: 'Second' };
const changes = { added: 1, updated: 0, removed: 0, duplicates_ignored: 0 };

let directory: string;
let file: string;

beforeEach(async () => {
  directory = await fs.mkdtemp(path.join(os.tmpdir(), 'rdme-glossary-'));
  file = path.join(directory, 'glossary.json');
  nock.disableNetConnect();
});

afterEach(async () => {
  nock.cleanAll();
  await fs.rm(directory, { recursive: true, force: true });
});

describe('glossary upload', () => {
  const run = runCommand(UploadCommand);

  it('merges by default, trims project terms and strips group terms from the request', async () => {
    await fs.writeFile(
      file,
      JSON.stringify({
        terms: [{ term: ' A ', definition: ' First ' }],
        group_terms: [b],
      }),
    );

    const result = { data: { terms: [a] }, changes };
    const mock = getAPIv2Mock(headers)
      .patch(endpoint, { terms: [a] })
      .reply(200, result);
    const output = await run([file, '--key', key]);
    expect(output.error).toBeUndefined();
    expect(output.result).toStrictEqual(result);
    expect(output.stderr).toContain('Ignoring group_terms');
    mock.done();
  });

  it('uses PUT for --replace and allows an empty project glossary with null group terms', async () => {
    await fs.writeFile(file, JSON.stringify({ terms: [], group_terms: null }));

    const mock = getAPIv2Mock(headers)
      .put(endpoint, { terms: [] })
      .reply(200, {
        data: { terms: [] },
        changes: { ...changes, added: 0 },
      });
    const output = await run([file, '--key', key, '--replace']);
    expect(output.error).toBeUndefined();
    expect(output.stderr).not.toContain('Ignoring group_terms');
    mock.done();
  });

  it.each([
    { input: { group_terms: [a] }, message: 'must contain a "terms" array' },
    { input: { terms: null }, message: 'must contain a "terms" array' },
    { input: { terms: [{ term: ' ', definition: 'Definition' }] }, message: 'Glossary entry 1' },
    { input: { terms: [{ term: 'Term', definition: ' ' }] }, message: 'Glossary entry 1' },
    { input: { terms: [{ term: 123, definition: 'Definition' }] }, message: 'Glossary entry 1' },
    { input: { terms: [{ ...a, inherited: true }] }, message: 'Glossary entry 1' },
    { input: { terms: [a], typo: true }, message: 'only support "terms" and optional "group_terms"' },
  ])('rejects invalid upload input before making requests: $input', async ({ input, message }) => {
    await fs.writeFile(file, JSON.stringify(input));
    const output = await run([file, '--key', key]);
    expect(output.error?.message).toContain(message);
  });

  it('reports malformed JSON before making requests', async () => {
    await fs.writeFile(file, '{');
    const output = await run([file, '--key', key]);
    expect(output.error?.message).toContain('expected a valid JSON glossary file');
  });

  it('previews an upload without sending a write request', async () => {
    await fs.writeFile(file, JSON.stringify({ terms: [b] }));

    const mock = getAPIv2Mock(headers)
      .get(endpoint)
      .reply(200, { data: { terms: [a], group_terms: null } });
    const output = await run([file, '--key', key, '--dry-run']);
    expect(output.error).toBeUndefined();
    expect(output.result).toStrictEqual({ data: { terms: [b, a] }, dry_run: true });
    mock.done();
  });
});

describe('glossary export', () => {
  const run = runCommand(ExportCommand);

  it.each([
    { includeGroup: false, groupTerms: null },
    { includeGroup: true, groupTerms: [{ ...a, definition: 'Group definition' }] },
    { includeGroup: true, groupTerms: null },
    { includeGroup: true, groupTerms: [] },
  ])('exports the API data with the requested group scope: %j', async ({ includeGroup, groupTerms }) => {
    const data = { terms: [a, b], group_terms: groupTerms };

    const mock = getAPIv2Mock(headers)
      .get(endpoint)
      .query(includeGroup ? { include_group: 'true' } : {})
      .reply(200, { data });
    const destination = path.join(directory, 'nested', 'glossary.json');
    const output = await run([destination, '--key', key, ...(includeGroup ? ['--include-group'] : [])]);
    expect(output.error).toBeUndefined();

    const expected = groupTerms === null ? { terms: [a, b] } : data;
    expect(JSON.parse(await fs.readFile(destination, 'utf8'))).toStrictEqual(expected);
    expect(output.result).toStrictEqual(expected);
    mock.done();
  });
});
