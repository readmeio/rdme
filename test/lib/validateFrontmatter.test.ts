import type { PageMetadata } from '../../src/lib/readPage.js';

import fs from 'node:fs';

import prompts from 'prompts';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import DocsUploadCommand from '../../src/commands/docs/upload.js';
import { validateFrontmatter } from '../../src/lib/validateFrontmatter.js';
import { setupOclifConfig } from '../helpers/oclif.js';

function page(overrides: Partial<PageMetadata> & Pick<PageMetadata, 'data' | 'filePath' | 'slug'>): PageMetadata {
  return {
    content: 'Body\n',
    hash: '',
    ...overrides,
  };
}

describe('#validateFrontmatter', () => {
  let command: DocsUploadCommand;

  beforeEach(async () => {
    const oclifConfig = await setupOclifConfig();
    command = new DocsUploadCommand([], oclifConfig);
    command.args = { path: 'docs' };
    command.flags = { 'confirm-autofixes': false, key: '' } as typeof command.flags;
    vi.spyOn(command, 'debug').mockImplementation(() => {});
    vi.spyOn(command, 'log').mockImplementation(() => {});
    vi.spyOn(command, 'warn').mockImplementation(input => input);
    vi.spyOn(fs, 'existsSync').mockImplementation(() => true);
    vi.spyOn(fs, 'mkdirSync').mockImplementation(() => '');
    vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
  });

  afterEach(() => {
    prompts.override({});
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('returns valid when no frontmatter issues are found', async () => {
    const pages = [
      page({
        data: { title: 'Introduction' },
        filePath: 'docs/intro.md',
        slug: 'intro',
      }),
    ];

    await expect(validateFrontmatter.call(command, pages)).resolves.toStrictEqual({
      pages,
      status: 'valid',
    });
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  it('throws in CI when autofixable issues are present and --confirm-autofixes is not set', async () => {
    vi.stubEnv('TEST_RDME_CI', 'true');

    const pages = [
      page({
        data: { title: 'Legacy', category: '5f92cbf10cf217478ba93561' },
        filePath: 'docs/legacy.md',
        slug: 'legacy',
      }),
    ];

    await expect(validateFrontmatter.call(command, pages)).rejects.toThrow(
      '1 file(s) have issues that should be fixed before uploading to ReadMe. Please run `rdme docs upload docs --dry-run` in a non-CI environment to fix them.',
    );
  });

  it('throws when the user declines autofixes', async () => {
    prompts.inject([false]);

    const pages = [
      page({
        data: { title: 'Legacy', category: '5f92cbf10cf217478ba93561' },
        filePath: 'docs/legacy.md',
        slug: 'legacy',
      }),
    ];

    await expect(validateFrontmatter.call(command, pages)).rejects.toThrow('Aborting upload due to user input.');
  });

  it('autofixes files and returns autofixed when the user confirms', async () => {
    prompts.inject([true]);

    const pages = [
      page({
        data: { title: 'Legacy', category: '5f92cbf10cf217478ba93561' },
        filePath: 'docs/legacy.md',
        slug: 'legacy',
      }),
    ];

    const result = await validateFrontmatter.call(command, pages);

    expect(result.status).toBe('autofixed');
    expect(result.pages[0].data).toMatchObject({
      title: 'Legacy',
      category: { uri: 'uri-that-does-not-map-to-5f92cbf10cf217478ba93561' },
    });
    expect(fs.writeFileSync).toHaveBeenCalledWith('docs/legacy.md', expect.stringContaining('category:'), {
      encoding: 'utf-8',
    });
  });

  it('bypasses the prompt when --confirm-autofixes is set', async () => {
    command.flags = { 'confirm-autofixes': true, key: '' } as typeof command.flags;

    const pages = [
      page({
        data: { title: 'Legacy', category: '5f92cbf10cf217478ba93561' },
        filePath: 'docs/legacy.md',
        slug: 'legacy',
      }),
    ];

    const result = await validateFrontmatter.call(command, pages);

    expect(result.status).toBe('autofixed');
    expect(result.pages[0].data.category).toStrictEqual({
      uri: 'uri-that-does-not-map-to-5f92cbf10cf217478ba93561',
    });
  });

  it('returns has-issues and warns when only unfixable issues are present', async () => {
    const pages = [
      page({
        data: {
          title: 'Broken',
          category: { uri: '/branches/stable/categories/guides/main', extra: true },
        },
        filePath: 'docs/broken.md',
        slug: 'broken',
      }),
    ];

    const result = await validateFrontmatter.call(command, pages);

    expect(result.status).toBe('has-issues');
    expect(result.pages).toStrictEqual(pages);
    expect(command.warn).toHaveBeenCalledWith(expect.stringContaining('cannot be fixed automatically'));
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  it('returns autofixed-with-issues when autofixes are applied alongside unfixable errors', async () => {
    prompts.inject([true]);

    const pages = [
      page({
        data: { title: 'Legacy', category: '5f92cbf10cf217478ba93561' },
        filePath: 'docs/legacy.md',
        slug: 'legacy',
      }),
      page({
        data: {
          title: 'Broken',
          category: { uri: '/branches/stable/categories/guides/main', extra: true },
        },
        filePath: 'docs/broken.md',
        slug: 'broken',
      }),
    ];

    const result = await validateFrontmatter.call(command, pages);

    expect(result.status).toBe('autofixed-with-issues');
    expect(result.pages[0].data.category).toStrictEqual({
      uri: 'uri-that-does-not-map-to-5f92cbf10cf217478ba93561',
    });
    expect(command.warn).toHaveBeenCalledWith(expect.stringContaining('Autofixable issues have been corrected'));
  });
});
