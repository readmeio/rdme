import type nock from 'nock';
import type { SchemaObject } from 'oas/types';

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import DocsUploadCommand from '../../src/commands/docs/upload.js';
import { fix } from '../../src/lib/frontmatter.js';
import { emptyMappings, fetchSchema } from '../../src/lib/readmeAPIFetch.js';
import { oasFetchMock } from '../helpers/get-api-mock.js';
import { setupOclifConfig } from '../helpers/oclif.js';

describe('#fix', () => {
  let command: DocsUploadCommand;
  let mock: nock.Scope;
  let schema: SchemaObject;

  beforeEach(async () => {
    const oclifConfig = await setupOclifConfig();
    command = new DocsUploadCommand([], oclifConfig);
    mock = oasFetchMock();
    schema = await fetchSchema.call(command);
  });

  afterEach(() => {
    mock.done();
  });

  it('should do nothing for an empty object', () => {
    const data = {};

    const result = fix.call(command, data, schema, emptyMappings);

    expect(result.hasIssues).toBe(false);
    expect(result.updatedData).toStrictEqual(data);
  });

  it('should do nothing for valid frontmatter', () => {
    const data = {
      title: 'Hello, world!',
      category: { uri: '/versions/stable/categories/guides/sup' },
    };

    const result = fix.call(command, data, schema, emptyMappings);

    expect(result.hasIssues).toBe(false);
    expect(result.updatedData).toStrictEqual(data);
  });

  it('should do nothing for valid frontmatter (with invalid category uri)', () => {
    const data = {
      title: 'Hello, world!',
      category: { uri: 'sup' },
    };

    const result = fix.call(command, data, schema, emptyMappings);

    expect(result.hasIssues).toBe(false);
    expect(result.updatedData).toStrictEqual(data);
  });

  it('should do nothing for valid frontmatter (with invalid parent uri)', () => {
    const data = {
      title: 'Hello, world!',
      parent: { uri: 'sup' },
    };

    const result = fix.call(command, data, schema, emptyMappings);

    expect(result.hasIssues).toBe(false);
    expect(result.updatedData).toStrictEqual(data);
  });

  it('should fix legacy category id and use mappings', () => {
    const data = {
      title: 'Hello, world!',
      category: '5f92cbf10cf217478ba93561',
    };

    const result = fix.call(command, data, schema, {
      categories: { '5f92cbf10cf217478ba93561': 'some-slug' },
      parentPages: {},
    });

    expect(result.hasIssues).toBe(true);
    expect(result.updatedData).toMatchInlineSnapshot(`
      {
        "category": {
          "uri": "some-slug",
        },
        "title": "Hello, world!",
      }
    `);
  });

  it('should fix legacy category id and use fallback mapping', () => {
    const data = {
      title: 'Hello, world!',
      category: '5f92cbf10cf217478ba93561',
    };

    const result = fix.call(command, data, schema, emptyMappings);

    expect(result.hasIssues).toBe(true);
    expect(result.updatedData).toMatchInlineSnapshot(`
      {
        "category": {
          "uri": "uri-that-does-not-map-to-5f92cbf10cf217478ba93561",
        },
        "title": "Hello, world!",
      }
    `);
  });

  it('should fix legacy category slug', () => {
    const data = {
      title: 'Hello, world!',
      categorySlug: 'some-slug',
    };

    const result = fix.call(command, data, schema, emptyMappings);

    expect(result.hasIssues).toBe(true);
    expect(result.updatedData).toMatchInlineSnapshot(`
      {
        "category": {
          "uri": "some-slug",
        },
        "title": "Hello, world!",
      }
    `);
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
    expect(result.updatedData).toMatchInlineSnapshot(`
      {
        "parent": {
          "uri": "some-slug",
        },
        "title": "Hello, world!",
      }
    `);
  });

  it('should delete legacy parent page id if no mapping is available', () => {
    const data = {
      title: 'Hello, world!',
      parentDoc: '5f92cbf10cf217478ba93561',
    };

    const result = fix.call(command, data, schema, emptyMappings);

    expect(result.hasIssues).toBe(true);
    expect(result.updatedData).toMatchInlineSnapshot(`
      {
        "title": "Hello, world!",
      }
    `);
  });

  it('should fix legacy parent page slug', () => {
    const data = {
      title: 'Hello, world!',
      parentDocSlug: 'some-slug',
    };

    const result = fix.call(command, data, schema, emptyMappings);

    expect(result.hasIssues).toBe(true);
    expect(result.updatedData).toMatchInlineSnapshot(`
      {
        "parent": {
          "uri": "some-slug",
        },
        "title": "Hello, world!",
      }
    `);
  });

  it('should fix excerpt', () => {
    const data = {
      title: 'Hello, world!',
      excerpt: 'This is an excerpt',
    };

    const result = fix.call(command, data, schema, emptyMappings);

    expect(result.hasIssues).toBe(true);
    expect(result.updatedData).toMatchInlineSnapshot(`
      {
        "content": {
          "excerpt": "This is an excerpt",
        },
        "title": "Hello, world!",
      }
    `);
  });

  it('should fix position', () => {
    const data = {
      title: 'Hello, world!',
      order: 5,
    };

    const result = fix.call(command, data, schema, emptyMappings);

    expect(result.hasIssues).toBe(true);
    expect(result.updatedData).toMatchInlineSnapshot(`
      {
        "position": 5,
        "title": "Hello, world!",
      }
    `);
  });

  it('should fix privacy (public)', () => {
    const data = {
      title: 'Hello, world!',
      hidden: false,
    };

    const result = fix.call(command, data, schema, emptyMappings);

    expect(result.hasIssues).toBe(true);
    expect(result.updatedData).toMatchInlineSnapshot(`
      {
        "privacy": {
          "view": "public",
        },
        "title": "Hello, world!",
      }
    `);
  });

  it('should fix privacy (anyone_with_link)', () => {
    const data = {
      title: 'Hello, world!',
      hidden: true,
    };

    const result = fix.call(command, data, schema, emptyMappings);

    expect(result.hasIssues).toBe(true);
    expect(result.updatedData).toMatchInlineSnapshot(`
      {
        "privacy": {
          "view": "anyone_with_link",
        },
        "title": "Hello, world!",
      }
    `);
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
    };

    const result = fix.call(command, data, schema, {
      categories: { '5f92cbf10cf217478ba93561': 'some-category-slug' },
      parentPages: { '5f92cbf10cf217478ba93561': 'some-parent-slug' },
    });

    expect(result.hasIssues).toBe(true);
    expect(result.updatedData).toMatchInlineSnapshot(`
      {
        "category": {
          "uri": "some-category-slug",
        },
        "content": {
          "body": "This is the body",
          "excerpt": "This is an excerpt",
        },
        "parent": {
          "uri": "some-parent-slug",
        },
        "position": 7,
        "privacy": {
          "view": "anyone_with_link",
        },
        "slug": "some-slug",
        "title": "Hello, world!",
      }
    `);
  });
});
