import fs from 'node:fs';

import nock from 'nock';
import prompts from 'prompts';
import { describe, afterEach, it, expect, beforeAll, beforeEach, vi } from 'vitest';

import CustomPgsCommand from '../../../src/commands/custompages/upload.js';
import { getAPIv1Mock, getAPIv2Mock, getAPIv2MockForGHA } from '../../helpers/get-api-mock.js';
import { githubActionsEnv } from '../../helpers/git-mock.js';
import { runCommand, type OclifOutput } from '../../helpers/oclif.js';

const key = 'rdme_123';
const authorization = `Bearer ${key}`;

describe('custompages upload', () => {
  let run: (args?: string[]) => OclifOutput;

  beforeAll(() => {
    run = runCommand(CustomPgsCommand);
  });

  beforeEach(() => {
    getAPIv1Mock().get('/api/v1/migration').basicAuth({ user: key }).reply(201, {
      categories: {},
      parentPages: {},
    });
    getAPIv2Mock({ authorization }).get('/projects/me').reply(200, {
      data: {},
    });
    vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
  });

  afterEach(() => {
    prompts.override({});
    vi.restoreAllMocks();
  });

  describe('given that the file path is a single file', () => {
    it('should create a page in ReadMe', async () => {
      const mock = getAPIv2Mock({ authorization })
        .get('/branches/stable/custom_pages/new-doc')
        .reply(404)
        .post('/branches/stable/custom_pages', {
          category: { uri: '/branches/stable/categories/custom_pages/category-slug' },
          slug: 'new-doc',
          title: 'This is the document title',
          content: { body: '\nBody\n' },
        })
        .reply(201, {});

      const result = await run(['__tests__/__fixtures__/custompages/new-docs/new-doc.md', '--key', key]);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).not.toHaveBeenCalled();

      mock.done();
    });

    it('should hide the warning if the `--hide-experimental-warning` flag is passed', async () => {
      const mock = getAPIv2Mock({ authorization })
        .get('/branches/stable/custom_pages/new-doc')
        .reply(404)
        .post('/branches/stable/custom_pages', {
          category: { uri: '/branches/stable/categories/custom_pages/category-slug' },
          slug: 'new-doc',
          title: 'This is the document title',
          content: { body: '\nBody\n' },
        })
        .reply(201, {});

      const result = await run([
        '__tests__/__fixtures__/custompages/new-docs/new-doc.md',
        '--key',
        key,
        '--hide-experimental-warning',
      ]);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).not.toHaveBeenCalled();

      mock.done();
    });

    it('should allow for user to specify branch via --branch flag', async () => {
      const mock = getAPIv2Mock({ authorization })
        .get('/branches/1.2.3/custom_pages/new-doc')
        .reply(404)
        .post('/branches/1.2.3/custom_pages', {
          category: { uri: '/branches/1.2.3/categories/custom_pages/category-slug' },
          slug: 'new-doc',
          title: 'This is the document title',
          content: { body: '\nBody\n' },
        })
        .reply(201, {});

      const result = await run([
        '__tests__/__fixtures__/custompages/new-docs/new-doc.md',
        '--key',
        key,
        '--branch',
        '1.2.3',
      ]);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).not.toHaveBeenCalled();

      mock.done();
    });

    it('should allow for user to specify branch via legacy --version flag', async () => {
      const mock = getAPIv2Mock({ authorization })
        .get('/branches/4.5.6/custom_pages/new-doc')
        .reply(404)
        .post('/branches/4.5.6/custom_pages', {
          category: { uri: '/branches/4.5.6/categories/custom_pages/category-slug' },
          slug: 'new-doc',
          title: 'This is the document title',
          content: { body: '\nBody\n' },
        })
        .reply(201, {});

      const result = await run([
        '__tests__/__fixtures__/custompages/new-docs/new-doc.md',
        '--key',
        key,
        '--version',
        '4.5.6',
      ]);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).not.toHaveBeenCalled();

      mock.done();
    });

    describe('given that the --dry-run flag is passed', () => {
      it('should not create anything in ReadMe', async () => {
        const mock = getAPIv2Mock({ authorization }).get('/branches/stable/custom_pages/new-doc').reply(404);

        const result = await run(['__tests__/__fixtures__/custompages/new-docs/new-doc.md', '--key', key, '--dry-run']);

        expect(result).toMatchSnapshot();
        expect(fs.writeFileSync).not.toHaveBeenCalled();

        mock.done();
      });

      it('should not update anything in ReadMe', async () => {
        const mock = getAPIv2Mock({ authorization }).get('/branches/stable/custom_pages/some-slug').reply(200);

        const result = await run([
          '__tests__/__fixtures__/custompages/slug-docs/new-doc-slug.md',
          '--key',
          key,
          '--dry-run',
        ]);

        expect(result).toMatchSnapshot();
        expect(fs.writeFileSync).not.toHaveBeenCalled();

        mock.done();
      });

      it('should error out if a non-404 error is returned from the GET request', async () => {
        const mock = getAPIv2Mock({ authorization }).get('/branches/stable/custom_pages/some-slug').reply(500);

        const result = await run([
          '__tests__/__fixtures__/custompages/slug-docs/new-doc-slug.md',
          '--key',
          key,
          '--dry-run',
        ]);

        expect(result).toMatchSnapshot();
        expect(fs.writeFileSync).not.toHaveBeenCalled();

        mock.done();
      });

      it('should error out if a non-404 error is returned from the GET request (with a json body)', async () => {
        const mock = getAPIv2Mock({ authorization }).get('/branches/stable/custom_pages/some-slug').reply(500, {
          title: 'bad request',
          detail: 'something went so so wrong',
          status: 500,
        });

        const result = await run([
          '__tests__/__fixtures__/custompages/slug-docs/new-doc-slug.md',
          '--key',
          key,
          '--dry-run',
        ]);

        expect(result).toMatchSnapshot();
        expect(fs.writeFileSync).not.toHaveBeenCalled();

        mock.done();
      });
    });

    describe('given that the slug is passed in the frontmatter', () => {
      it('should use that slug to create a page in ReadMe', async () => {
        const mock = getAPIv2Mock({ authorization })
          .get('/branches/stable/custom_pages/some-slug')
          .reply(404)
          .post('/branches/stable/custom_pages', {
            category: { uri: '/branches/stable/categories/custom_pages/some-category-uri' },
            title: 'This is the document title',
            content: { body: '\nBody\n' },
            slug: 'some-slug',
          })
          .reply(201, {});

        const result = await run(['__tests__/__fixtures__/custompages/slug-docs/new-doc-slug.md', '--key', key]);

        expect(result).toMatchSnapshot();
        expect(fs.writeFileSync).not.toHaveBeenCalled();

        mock.done();
      });

      it('should use that slug update an existing page in ReadMe', async () => {
        const mock = getAPIv2Mock({ authorization })
          .get('/branches/stable/custom_pages/some-slug')
          .reply(200)
          .patch('/branches/stable/custom_pages/some-slug', {
            category: { uri: '/branches/stable/categories/custom_pages/some-category-uri' },
            title: 'This is the document title',
            content: { body: '\nBody\n' },
          })
          .reply(201, {});

        const result = await run(['__tests__/__fixtures__/custompages/slug-docs/new-doc-slug.md', '--key', key]);

        expect(result).toMatchSnapshot();
        expect(fs.writeFileSync).not.toHaveBeenCalled();

        mock.done();
      });
    });

    describe('given that the file has frontmatter issues', () => {
      it('should fix the frontmatter issues in the file and create the corrected file in ReadMe', async () => {
        const mock = getAPIv2Mock({ authorization })
          .get('/branches/stable/custom_pages/legacy-category')
          .reply(404)
          .post('/branches/stable/custom_pages', {
            category: {
              uri: '/branches/stable/categories/custom_pages/uri-that-does-not-map-to-5ae122e10fdf4e39bb34db6f',
            },
            slug: 'legacy-category',
            title: 'This is the document title',
            content: { body: '\nBody\n' },
          })
          .reply(201, {});

        prompts.inject([true]);

        const result = await run(['__tests__/__fixtures__/custompages/mixed-docs/legacy-category.md', '--key', key]);

        expect(result).toMatchSnapshot();
        expect(fs.writeFileSync).toHaveBeenCalledWith(
          '__tests__/__fixtures__/custompages/mixed-docs/legacy-category.md',
          expect.stringContaining('uri: uri-that-does-not-map-to-5ae122e10fdf4e39bb34db6f'),
          { encoding: 'utf-8' },
        );

        mock.done();
      });

      it('should fix the frontmatter issues in the file and insert the proper category mapping', async () => {
        nock.cleanAll();
        const mappingsMock = getAPIv1Mock()
          .get('/api/v1/migration')
          .basicAuth({ user: key })
          .reply(201, {
            categories: { '5ae122e10fdf4e39bb34db6f': 'mapped-uri' },
          });

        const mock = getAPIv2Mock({ authorization })
          .get('/branches/stable/custom_pages/legacy-category')
          .reply(404)
          .post('/branches/stable/custom_pages', {
            category: { uri: '/branches/stable/categories/custom_pages/mapped-uri' },
            slug: 'legacy-category',
            title: 'This is the document title',
            content: { body: '\nBody\n' },
          })
          .reply(201, {});

        const projectsMeMock = getAPIv2Mock({ authorization }).get('/projects/me').reply(200, {
          data: {},
        });

        prompts.inject([true]);

        const result = await run(['__tests__/__fixtures__/custompages/mixed-docs/legacy-category.md', '--key', key]);

        expect(result).toMatchSnapshot();
        expect(fs.writeFileSync).toHaveBeenCalledWith(
          '__tests__/__fixtures__/custompages/mixed-docs/legacy-category.md',
          expect.stringContaining('uri: mapped-uri'),
          { encoding: 'utf-8' },
        );

        mappingsMock.done();
        mock.done();
        projectsMeMock.done();
      });

      it('should exit if the user declines to fix the issues', async () => {
        prompts.inject([false]);

        const result = await run(['__tests__/__fixtures__/custompages/mixed-docs/legacy-category.md', '--key', key]);

        expect(result).toMatchSnapshot();
        expect(fs.writeFileSync).not.toHaveBeenCalled();
      });

      it('should skip client-side validation if the --skip-validation flag is passed', async () => {
        const mock = getAPIv2Mock({ authorization })
          .get('/branches/stable/custom_pages/legacy-category')
          .reply(404)
          .post('/branches/stable/custom_pages', {
            category: '5ae122e10fdf4e39bb34db6f',
            slug: 'legacy-category',
            title: 'This is the document title',
            content: { body: '\nBody\n' },
          })
          .reply(400, { title: 'bad request', detail: 'your category is whack' });

        const result = await run([
          '__tests__/__fixtures__/custompages/mixed-docs/legacy-category.md',
          '--key',
          key,
          '--skip-validation',
        ]);

        expect(result).toMatchSnapshot();
        expect(fs.writeFileSync).not.toHaveBeenCalled();

        mock.done();
      });

      it('should warn user if the file has no autofixable issues', async () => {
        const mock = getAPIv2Mock({ authorization })
          .get('/branches/stable/custom_pages/invalid-attributes')
          .reply(404)
          .post('/branches/stable/custom_pages', {
            category: {
              uri: '/branches/stable/categories/custom_pages/some-category-uri',
              'is-this-a-valid-property': 'nope',
            },
            slug: 'invalid-attributes',
            title: 'This is the document title',
            content: { body: '\nBody\n' },
          })
          .reply(201, {});

        const result = await run(['__tests__/__fixtures__/custompages/mixed-docs/invalid-attributes.md', '--key', key]);

        expect(result).toMatchSnapshot();
        expect(fs.writeFileSync).not.toHaveBeenCalled();

        mock.done();
      });
    });

    describe('and the command is being run in a CI environment', () => {
      beforeEach(githubActionsEnv.before);

      afterEach(githubActionsEnv.after);

      it('should create a page in ReadMe and include `x-readme-source-url` source header', async () => {
        const getMock = getAPIv2MockForGHA({ authorization }).get('/branches/stable/custom_pages/new-doc').reply(404);

        const postMock = getAPIv2MockForGHA({
          authorization,
          'x-readme-source-url':
            'https://github.com/octocat/Hello-World/blob/ffac537e6cbbf934b08745a378932722df287a53/__tests__/__fixtures__/custompages/new-docs/new-doc.md',
        })
          .post('/branches/stable/custom_pages', {
            category: { uri: '/branches/stable/categories/custom_pages/category-slug' },
            slug: 'new-doc',
            title: 'This is the document title',
            content: { body: '\nBody\n' },
          })
          .reply(201, {});

        const projectsMeMock = getAPIv2MockForGHA({ authorization }).get('/projects/me').reply(200, {
          data: {},
        });

        const result = await run(['__tests__/__fixtures__/custompages/new-docs/new-doc.md', '--key', key]);

        expect(result).toMatchSnapshot();
        expect(fs.writeFileSync).not.toHaveBeenCalled();

        getMock.done();
        postMock.done();
        projectsMeMock.done();
      });

      it('should error out if the file has validation errors', async () => {
        const projectsMeMock = getAPIv2MockForGHA({ authorization }).get('/projects/me').reply(200, {
          data: {},
        });
        const result = await run(['__tests__/__fixtures__/custompages/mixed-docs/legacy-category.md', '--key', key]);

        expect(result).toMatchSnapshot();
        expect(fs.writeFileSync).not.toHaveBeenCalled();
        projectsMeMock.done();
      });

      it('should bypass prompt if `--confirm-autofixes` flag is passed', async () => {
        const getMock = getAPIv2MockForGHA({ authorization })
          .get('/branches/stable/custom_pages/legacy-category')
          .reply(404);

        const postMock = getAPIv2MockForGHA({
          authorization,
          'x-readme-source-url':
            'https://github.com/octocat/Hello-World/blob/ffac537e6cbbf934b08745a378932722df287a53/__tests__/__fixtures__/custompages/mixed-docs/legacy-category.md',
        })
          .post('/branches/stable/custom_pages', {
            category: {
              uri: '/branches/stable/categories/custom_pages/uri-that-does-not-map-to-5ae122e10fdf4e39bb34db6f',
            },
            slug: 'legacy-category',
            title: 'This is the document title',
            content: { body: '\nBody\n' },
          })
          .reply(201, {});

        const projectsMeMock = getAPIv2MockForGHA({ authorization }).get('/projects/me').reply(200, {
          data: {},
        });

        const result = await run([
          '__tests__/__fixtures__/custompages/mixed-docs/legacy-category.md',
          '--key',
          key,
          '--confirm-autofixes',
        ]);

        expect(result).toMatchSnapshot();
        expect(fs.writeFileSync).toHaveBeenCalledWith(
          '__tests__/__fixtures__/custompages/mixed-docs/legacy-category.md',
          expect.stringContaining('uri: uri-that-does-not-map-to-5ae122e10fdf4e39bb34db6f'),
          { encoding: 'utf-8' },
        );
        getMock.done();
        postMock.done();
        projectsMeMock.done();
      });
    });

    it('should error out if a non-404 error is returned from the GET request', async () => {
      const mock = getAPIv2Mock({ authorization }).get('/branches/stable/custom_pages/new-doc').reply(500);

      const result = await run(['__tests__/__fixtures__/custompages/new-docs/new-doc.md', '--key', key]);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).not.toHaveBeenCalled();

      mock.done();
    });

    it('should error out if a non-404 error is returned from the GET request (with a json body)', async () => {
      const mock = getAPIv2Mock({ authorization }).get('/branches/stable/custom_pages/new-doc').reply(500, {
        title: 'bad request',
        detail: 'something went so so wrong',
        status: 500,
      });

      const result = await run(['__tests__/__fixtures__/custompages/new-docs/new-doc.md', '--key', key]);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).not.toHaveBeenCalled();

      mock.done();
    });

    it('should not throw an error if `max-errors` flag is set to -1', async () => {
      const mock = getAPIv2Mock({ authorization }).get('/branches/stable/custom_pages/new-doc').reply(500, {
        title: 'bad request',
        detail: 'something went so so wrong',
        status: 500,
      });

      const result = await run([
        '__tests__/__fixtures__/custompages/new-docs/new-doc.md',
        '--key',
        key,
        '--max-errors',
        '-1',
      ]);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).not.toHaveBeenCalled();

      mock.done();
    });

    it('should error out if the file does not exist', async () => {
      const result = await run(['non-existent-file', '--key', key]);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });

    it('should error out if the file has an invalid file extension', async () => {
      const result = await run(['package.json', '--key', key]);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });
  });

  describe('given that the file path is a directory', () => {
    it('should create a page in ReadMe for each file in the directory and its subdirectories', async () => {
      const mock = getAPIv2Mock({ authorization })
        .get('/branches/stable/custom_pages/simple-doc')
        .reply(404)
        .post('/branches/stable/custom_pages', {
          slug: 'simple-doc',
          title: 'This is the document title',
          content: { body: '\nBody\n' },
        })
        .reply(201, {})
        .get('/branches/stable/custom_pages/another-doc')
        .reply(404)
        .post('/branches/stable/custom_pages', {
          slug: 'another-doc',
          title: 'This is another document title',
          content: { body: '\nAnother body\n' },
          category: { uri: '/branches/stable/categories/custom_pages/category-slug' },
        })
        .reply(201, {});

      const result = await run(['__tests__/__fixtures__/custompages/existing-docs', '--key', key]);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).not.toHaveBeenCalled();

      mock.done();
    });

    it('should update existing pages in ReadMe for each file in the directory and its subdirectories', async () => {
      const mock = getAPIv2Mock({ authorization })
        .get('/branches/stable/custom_pages/simple-doc')
        .reply(200)
        .patch('/branches/stable/custom_pages/simple-doc', {
          title: 'This is the document title',
          content: { body: '\nBody\n' },
        })
        .reply(201, {})
        .get('/branches/stable/custom_pages/another-doc')
        .reply(200)
        .patch('/branches/stable/custom_pages/another-doc', {
          title: 'This is another document title',
          category: { uri: '/branches/stable/categories/custom_pages/category-slug' },
          content: { body: '\nAnother body\n' },
        })
        .reply(201, {});

      const result = await run(['__tests__/__fixtures__/custompages/existing-docs', '--key', key]);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).not.toHaveBeenCalled();

      mock.done();
    });

    it('should handle complex frontmatter', async () => {
      const mock = getAPIv2Mock({ authorization })
        .get('/branches/stable/custom_pages/basic')
        .reply(200)
        .patch('/branches/stable/custom_pages/basic', {
          title: 'This is the document title',
          category: { uri: '/branches/stable/categories/custom_pages/category-slug' },
          content: { body: 'frontmatter body', excerpt: 'frontmatter excerpt' },
          type: 'basic',
        })
        .reply(201, {})
        .get('/branches/stable/custom_pages/link')
        .reply(200)
        .patch('/branches/stable/custom_pages/link', {
          title: 'This is the document title',
          category: { uri: '/branches/stable/categories/custom_pages/category-slug' },
          content: {
            body: '\nBody\n',
            excerpt: 'frontmatter excerpt',
            link: { url: 'https://example.com', new_tab: true },
          },
          type: 'link',
        })
        .reply(201, {});

      const result = await run(['__tests__/__fixtures__/custompages/complex-frontmatter', '--key', key]);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).not.toHaveBeenCalled();

      mock.done();
    });

    describe('given that the directory contains parent/child docs', () => {
      it('should upload parents before children', async () => {
        const mock = getAPIv2Mock({ authorization })
          .get('/branches/stable/custom_pages/child')
          .reply(404)
          .post('/branches/stable/custom_pages', {
            slug: 'child',
            title: 'Child',
            parent: { uri: '/branches/stable/custom_pages/parent' },
            content: { body: '\nBody\n' },
          })
          .reply(201, {})
          .get('/branches/stable/custom_pages/friend')
          .reply(404)
          .post('/branches/stable/custom_pages', {
            slug: 'friend',
            title: 'Friend',
            content: { body: '\nBody\n' },
          })
          .reply(201, {})
          .get('/branches/stable/custom_pages/parent')
          .reply(404)
          .post('/branches/stable/custom_pages', {
            slug: 'parent',
            title: 'Parent',
            parent: { uri: '/branches/stable/custom_pages/grandparent' },
            content: { body: '\nBody\n' },
          })
          .reply(201, {})
          .get('/branches/stable/custom_pages/grandparent')
          .reply(404)
          .post('/branches/stable/custom_pages', {
            slug: 'grandparent',
            title: 'Grandparent',
            content: { body: '\nBody\n' },
          })
          .reply(201, {});

        const result = await run(['__tests__/__fixtures__/custompages/multiple-docs', '--key', key]);

        expect(result).toMatchSnapshot();
        expect(fs.writeFileSync).not.toHaveBeenCalled();

        mock.done();
      });
    });

    it('should error out if the directory does not contain any Markdown files', async () => {
      const result = await run(['__tests__/__fixtures__/ref-oas', '--key', key]);

      expect(result).toMatchSnapshot();
    });

    it('should handle a mix of creates and updates and failures and skipped files', async () => {
      const mock = getAPIv2Mock({ authorization })
        .get('/branches/stable/custom_pages/invalid-attributes')
        .reply(404)
        .post('/branches/stable/custom_pages', {
          category: {
            uri: '/branches/stable/categories/custom_pages/some-category-uri',
            'is-this-a-valid-property': 'nope',
          },
          slug: 'invalid-attributes',
          title: 'This is the document title',
          content: { body: '\nBody\n' },
        })
        .reply(201, {})
        .get('/branches/stable/custom_pages/legacy-category')
        .reply(200)
        .patch('/branches/stable/custom_pages/legacy-category', {
          category: {
            uri: '/branches/stable/categories/custom_pages/uri-that-does-not-map-to-5ae122e10fdf4e39bb34db6f',
          },
          title: 'This is the document title',
          content: { body: '\nBody\n' },
        })
        .reply(201, {})
        .get('/branches/stable/custom_pages/some-slug')
        .reply(404)
        .post('/branches/stable/custom_pages', {
          slug: 'some-slug',
          title: 'This is the document title',
          category: { uri: '/branches/stable/categories/custom_pages/some-category-uri' },
          content: { body: '\nBody\n' },
        })
        .reply(500, {})
        .get('/branches/stable/custom_pages/simple-doc')
        .reply(404)
        .post('/branches/stable/custom_pages', {
          slug: 'simple-doc',
          title: 'This is the document title',
          content: { body: '\nBody\n' },
        })
        .reply(500, {});

      prompts.inject([true]);

      const result = await run(['__tests__/__fixtures__/custompages/mixed-docs', '--key', key]);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).toHaveBeenCalledTimes(5);

      mock.done();
    });

    it('should handle a mix of creates and updates and failures and skipped files and not error out with `max-errors` flag', async () => {
      const mock = getAPIv2Mock({ authorization })
        .get('/branches/stable/custom_pages/invalid-attributes')
        .reply(404)
        .post('/branches/stable/custom_pages', {
          category: {
            uri: '/branches/stable/categories/custom_pages/some-category-uri',
            'is-this-a-valid-property': 'nope',
          },
          slug: 'invalid-attributes',
          title: 'This is the document title',
          content: { body: '\nBody\n' },
        })
        .reply(201, {})
        .get('/branches/stable/custom_pages/legacy-category')
        .reply(200)
        .patch('/branches/stable/custom_pages/legacy-category', {
          category: {
            uri: '/branches/stable/categories/custom_pages/uri-that-does-not-map-to-5ae122e10fdf4e39bb34db6f',
          },
          title: 'This is the document title',
          content: { body: '\nBody\n' },
        })
        .reply(201, {})
        .get('/branches/stable/custom_pages/some-slug')
        .reply(404)
        .post('/branches/stable/custom_pages', {
          slug: 'some-slug',
          title: 'This is the document title',
          category: { uri: '/branches/stable/categories/custom_pages/some-category-uri' },
          content: { body: '\nBody\n' },
        })
        .reply(500, {})
        .get('/branches/stable/custom_pages/simple-doc')
        .reply(404)
        .post('/branches/stable/custom_pages', {
          slug: 'simple-doc',
          title: 'This is the document title',
          content: { body: '\nBody\n' },
        })
        .reply(500, {});

      prompts.inject([true]);

      const result = await run(['__tests__/__fixtures__/custompages/mixed-docs', '--key', key, '--max-errors', '10']);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).toHaveBeenCalledTimes(5);

      mock.done();
    });

    it('should handle a mix of creates and updates and failures and skipped files (dry run)', async () => {
      const mock = getAPIv2Mock({ authorization })
        .get('/branches/stable/custom_pages/invalid-attributes')
        .reply(404)
        .get('/branches/stable/custom_pages/legacy-category')
        .reply(200)
        .get('/branches/stable/custom_pages/some-slug')
        .reply(500)
        .get('/branches/stable/custom_pages/simple-doc')
        .reply(500);

      prompts.inject([true]);

      const result = await run(['__tests__/__fixtures__/custompages/mixed-docs', '--key', key, '--dry-run']);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).toHaveBeenCalledTimes(5);

      mock.done();
    });
  });

  describe('given that ReadMe project has bidirection sync set up', () => {
    it('should error if validation is not skipped', async () => {
      nock.cleanAll();

      const mock = getAPIv2Mock({ authorization })
        .get('/projects/me')
        .reply(200, {
          data: { git: { connection: { status: 'active' } } },
        });

      const result = await run(['__tests__/__fixtures__/custompages/new-docs/new-doc.md', '--key', key]);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).not.toHaveBeenCalled();

      mock.done();
    });

    it('should upload if validation is skipped', async () => {
      nock.cleanAll();

      const mock = getAPIv2Mock({ authorization })
        .get('/branches/stable/custom_pages/new-doc')
        .reply(404)
        .post('/branches/stable/custom_pages', {
          category: { uri: '/branches/stable/categories/custom_pages/category-slug' },
          slug: 'new-doc',
          title: 'This is the document title',
          content: { body: '\nBody\n' },
        })
        .reply(201, {});

      const projectsMeMock = getAPIv2Mock({ authorization })
        .get('/projects/me')
        .reply(200, {
          data: { git: { connection: { status: 'active' } } },
        });

      const result = await run([
        '__tests__/__fixtures__/custompages/new-docs/new-doc.md',
        '--key',
        key,
        '--skip-validation',
      ]);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).not.toHaveBeenCalled();

      mock.done();
      projectsMeMock.done();
    });

    it('should handle an error if /projects/me returns an error', async () => {
      nock.cleanAll();

      const mock = getAPIv2Mock({ authorization: 'Bearer bad-api-key' })
        .get('/projects/me')
        .reply(401, {
          title: "The API key couldn't be located.",
          detail:
            "The API key you passed in (bad-api-key) doesn't match any keys we have in our system. API keys must be passed in via Bearer token. You can get your API key in Configuration > API Key, or in the docs.",
          instance: '/reference/intro/authentication',
          poem: [
            'The ancient gatekeeper declares:',
            "'To pass, reveal your API key.'",
            "'bad-…', you start to ramble",
            'Oops, you remembered it poorly!',
          ],
        });

      const result = await run(['__tests__/__fixtures__/custompages/new-docs/new-doc.md', '--key', 'bad-api-key']);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).not.toHaveBeenCalled();

      mock.done();
    });
  });
});
