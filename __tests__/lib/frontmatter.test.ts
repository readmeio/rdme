import type { SchemaObject } from 'oas/types';
import type { APIv2PageCommands } from '../../src/index.js';
import type { PageMetadata } from '../../src/lib/readPage.js';

import fs from 'node:fs';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ChangelogUploadCommand from '../../src/commands/changelog/upload.js';
import CustomPagesUploadCommand from '../../src/commands/custompages/upload.js';
import DocsMigrateCommand from '../../src/commands/docs/migrate.js';
import DocsUploadCommand from '../../src/commands/docs/upload.js';
import RefUploadCommand from '../../src/commands/reference/upload.js';
import { fix, writeFixes } from '../../src/lib/frontmatter.js';
import { emptyMappings, fetchSchema } from '../../src/lib/readmeAPIFetch.js';
import { setupOclifConfig } from '../helpers/oclif.js';

describe.each([
  ['guides upload', DocsUploadCommand],
  ['guides migrate', DocsMigrateCommand],
  ['reference upload', RefUploadCommand],
  ['changelog upload', ChangelogUploadCommand],
  ['custompages upload', CustomPagesUploadCommand],
] as const)('#fix (%s)', (_c, Command) => {
  let command: APIv2PageCommands;
  let schema: SchemaObject;

  beforeEach(async () => {
    const oclifConfig = await setupOclifConfig();
    command = new Command([], oclifConfig);
    schema = fetchSchema.call(command);
  });

  it('should do nothing for an empty object', () => {
    const data = {};

    const result = fix.call(command, data, schema, emptyMappings);

    expect(result.hasIssues).toBe(false);
    expect(result.updatedData).toStrictEqual(data);
  });

  it('should handle full category URIs', () => {
    const data = {
      title: 'Hello, world!',
      category: { uri: '/branches/stable/categories/guides/sup' },
    };

    const result = fix.call(command, data, schema, emptyMappings);

    expect(result.hasIssues).toBe(command.route === 'changelogs' || command.route === 'custom_pages');
    expect(result.updatedData).toMatchSnapshot();
  });

  it('should handle partial category URIs', () => {
    const data = {
      title: 'Hello, world!',
      category: { uri: 'sup' },
    };

    const result = fix.call(command, data, schema, emptyMappings);

    expect(result.hasIssues).toBe(command.route === 'changelogs' || command.route === 'custom_pages');
    expect(result.updatedData).toMatchSnapshot();
  });

  it('should handle full parent page URIs', () => {
    const data = {
      title: 'Hello, world!',
      parent: { uri: 'sup' },
    };

    const result = fix.call(command, data, schema, emptyMappings);

    expect(result.hasIssues).toBe(command.route === 'changelogs' || command.route === 'custom_pages');
    expect(result.updatedData).toMatchSnapshot();
  });

  it('should handle partial parent page URIs', () => {
    const data = {
      title: 'Hello, world!',
      category: '5f92cbf10cf217478ba93561',
    };

    const result = fix.call(command, data, schema, {
      categories: { '5f92cbf10cf217478ba93561': 'some-slug' },
      parentPages: {},
    });

    expect(result.hasIssues).toBe(true);
    expect(result.updatedData).toMatchSnapshot();
  });

  it('should fix legacy category id and use fallback mapping', () => {
    const data = {
      title: 'Hello, world!',
      category: '5f92cbf10cf217478ba93561',
    };

    const result = fix.call(command, data, schema, emptyMappings);

    expect(result.hasIssues).toBe(true);
    expect(result.updatedData).toMatchSnapshot();
  });

  it('should fix legacy category slug', () => {
    const data = {
      title: 'Hello, world!',
      categorySlug: 'some-slug',
    };

    const result = fix.call(command, data, schema, emptyMappings);

    expect(result.hasIssues).toBe(true);
    expect(result.updatedData).toMatchSnapshot();
  });

  it('should fix legacy parent page id and use mappings', () => {
    const data = {
      title: 'Hello, world!',
      parentDoc: '5f92cbf10cf217478ba93561',
    };

    const result = fix.call(command, data, schema, {
      categories: {},
      parentPages: { '5f92cbf10cf217478ba93561': 'some-slug' },
    });

    expect(result.hasIssues).toBe(true);
    expect(result.updatedData).toMatchSnapshot();
  });

  it('should delete legacy parent page id if no mapping is available', () => {
    const data = {
      title: 'Hello, world!',
      parentDoc: '5f92cbf10cf217478ba93561',
    };

    const result = fix.call(command, data, schema, emptyMappings);

    expect(result.hasIssues).toBe(true);
    expect(result.updatedData).toMatchSnapshot();
  });

  it('should fix legacy parent page slug', () => {
    const data = {
      title: 'Hello, world!',
      parentDocSlug: 'some-slug',
    };

    const result = fix.call(command, data, schema, emptyMappings);

    expect(result.hasIssues).toBe(true);
    expect(result.updatedData).toMatchSnapshot();
  });

  it('should fix excerpt', () => {
    const data = {
      title: 'Hello, world!',
      excerpt: 'This is an excerpt',
    };

    const result = fix.call(command, data, schema, emptyMappings);

    expect(result.hasIssues).toBe(true);
    expect(result.updatedData).toMatchSnapshot();
  });

  it('should fix position', () => {
    const data = {
      title: 'Hello, world!',
      order: 5,
    };

    const result = fix.call(command, data, schema, emptyMappings);

    expect(result.hasIssues).toBe(true);
    expect(result.updatedData).toMatchSnapshot();
  });

  it('should fix privacy (public)', () => {
    const data = {
      title: 'Hello, world!',
      hidden: false,
    };

    const result = fix.call(command, data, schema, emptyMappings);

    expect(result.hasIssues).toBe(true);
    expect(result.updatedData).toMatchSnapshot();
  });

  it('should fix privacy (public, `hidden` is a string)', () => {
    const data = {
      title: 'Hello, world!',
      hidden: 'false',
    };

    const result = fix.call(command, data, schema, emptyMappings);

    expect(result.hasIssues).toBe(true);
    expect(result.updatedData).toMatchSnapshot();
  });

  it('should fix privacy (anyone_with_link)', () => {
    const data = {
      title: 'Hello, world!',
      hidden: true,
    };

    const result = fix.call(command, data, schema, emptyMappings);

    expect(result.hasIssues).toBe(true);
    expect(result.updatedData).toMatchSnapshot();
  });

  it('should fix privacy (anyone_with_link, `hidden` is a string)', () => {
    const data = {
      title: 'Hello, world!',
      hidden: 'true',
    };

    const result = fix.call(command, data, schema, emptyMappings);

    expect(result.hasIssues).toBe(true);
    expect(result.updatedData).toMatchSnapshot();
  });

  it('should fix htmlmode (true)', () => {
    const data = {
      title: 'Hello, world!',
      htmlmode: true,
    };

    const result = fix.call(command, data, schema, emptyMappings);

    expect(result.hasIssues).toBe(true);
    expect(result.updatedData).toMatchSnapshot();
  });

  it('should fix htmlmode (false)', () => {
    const data = {
      title: 'Hello, world!',
      htmlmode: false,
    };

    const result = fix.call(command, data, schema, emptyMappings);

    expect(result.hasIssues).toBe(true);
    expect(result.updatedData).toMatchSnapshot();
  });

  it('should fix fullscreen', () => {
    const data = {
      title: 'Hello, world!',
      fullscreen: true,
    };

    const result = fix.call(command, data, schema, emptyMappings);

    expect(result.hasIssues).toBe(true);
    expect(result.updatedData).toMatchSnapshot();
  });

  it.todo('should fix metadata object');

  it.todo('should fix content.link object');

  it.todo('should fix content.next object');

  it('should fix multiple issues', () => {
    const data = {
      title: 'Hello, world!',
      category: '5f92cbf10cf217478ba93561',
      parentDocSlug: 'some-parent-slug',
      excerpt: 'This is an excerpt',
      content: {
        body: 'This is the body',
      },
      order: 7,
      hidden: true,
      slug: 'some-slug',
      htmlmode: false,
    };

    const result = fix.call(command, data, schema, {
      categories: { '5f92cbf10cf217478ba93561': 'some-category-slug' },
      parentPages: { '5f92cbf10cf217478ba93561': 'some-parent-slug' },
    });

    expect(result.hasIssues).toBe(true);
    expect(result.updatedData).toMatchSnapshot();
  });
});

describe('#writeFixes', () => {
  let command: DocsUploadCommand;

  const mockPageData: PageMetadata = {
    content: 'some content',
    data: {
      updated: false,
    },
    filePath: 'docs/page.md',
    hash: '',
    slug: 'some-page',
  };

  beforeEach(async () => {
    const oclifConfig = await setupOclifConfig();
    command = new DocsUploadCommand([], oclifConfig);
    vi.spyOn(fs, 'existsSync').mockImplementation(() => false);
    vi.spyOn(fs, 'mkdirSync').mockImplementation(() => '');
    vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should write changes', () => {
    writeFixes.call(command, mockPageData, { updated: true });

    expect(fs.writeFileSync).toHaveBeenCalledWith(mockPageData.filePath, expect.stringContaining('updated: true'), {
      encoding: 'utf-8',
    });
  });

  it('should write changes to current directory', () => {
    writeFixes.call(command, mockPageData, { updated: true }, '.');

    expect(fs.writeFileSync).toHaveBeenCalledWith(mockPageData.filePath, expect.stringContaining('updated: true'), {
      encoding: 'utf-8',
    });
  });

  it('should write changes to specified output directory', () => {
    writeFixes.call(command, mockPageData, { updated: true }, 'out');

    expect(fs.writeFileSync).toHaveBeenCalledWith('out/docs/page.md', expect.stringContaining('updated: true'), {
      encoding: 'utf-8',
    });
  });

  it('should write changes to specified output directory (with trailing slash)', () => {
    writeFixes.call(command, mockPageData, { updated: true }, 'out/');

    expect(fs.writeFileSync).toHaveBeenCalledWith('out/docs/page.md', expect.stringContaining('updated: true'), {
      encoding: 'utf-8',
    });
  });
});
