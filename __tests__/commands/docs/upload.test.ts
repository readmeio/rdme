import fs from 'node:fs';

import nock from 'nock';
import prompts from 'prompts';
import { describe, afterEach, it, expect, beforeAll, beforeEach, vi } from 'vitest';

import Command from '../../../src/commands/docs/upload.js';
import { getAPIv1Mock, getAPIv2Mock, getAPIv2MockForGHA } from '../../helpers/get-api-mock.js';
import { githubActionsEnv } from '../../helpers/git-mock.js';
import { runCommand, type OclifOutput } from '../../helpers/oclif.js';

const key = 'rdme_123';
const authorization = `Bearer ${key}`;

describe('rdme docs upload', () => {
  let run: (args?: string[]) => OclifOutput;

  beforeAll(() => {
    run = runCommand(Command);
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
    vi.restoreAllMocks();
  });

  describe('given that the file path is a single file', () => {
    it('should create a guides page in ReadMe', async () => {
      const mock = getAPIv2Mock({ authorization })
        .get('/versions/stable/guides/new-doc')
        .reply(404)
        .post('/versions/stable/guides', {
          category: { uri: '/versions/stable/categories/guides/category-slug' },
          slug: 'new-doc',
          title: 'This is the document title',
          content: { body: '\nBody\n' },
        })
        .reply(201, {});

      const result = await run(['__tests__/__fixtures__/docs/new-docs/new-doc.md', '--key', key]);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).not.toHaveBeenCalled();

      mock.done();
    });

    it('should hide the warning if the `--hide-experimental-warning` flag is passed', async () => {
      const mock = getAPIv2Mock({ authorization })
        .get('/versions/stable/guides/new-doc')
        .reply(404)
        .post('/versions/stable/guides', {
          category: { uri: '/versions/stable/categories/guides/category-slug' },
          slug: 'new-doc',
          title: 'This is the document title',
          content: { body: '\nBody\n' },
        })
        .reply(201, {});

      const result = await run([
        '__tests__/__fixtures__/docs/new-docs/new-doc.md',
        '--key',
        key,
        '--hide-experimental-warning',
      ]);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).not.toHaveBeenCalled();

      mock.done();
    });

    it('should allow for user to specify version via --version flag', async () => {
      const mock = getAPIv2Mock({ authorization })
        .get('/versions/1.2.3/guides/new-doc')
        .reply(404)
        .post('/versions/1.2.3/guides', {
          category: { uri: '/versions/1.2.3/categories/guides/category-slug' },
          slug: 'new-doc',
          title: 'This is the document title',
          content: { body: '\nBody\n' },
        })
        .reply(201, {});

      const result = await run(['__tests__/__fixtures__/docs/new-docs/new-doc.md', '--key', key, '--version', '1.2.3']);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).not.toHaveBeenCalled();

      mock.done();
    });

    describe('given that the --dry-run flag is passed', () => {
      it('should not create anything in ReadMe', async () => {
        const mock = getAPIv2Mock({ authorization }).get('/versions/stable/guides/new-doc').reply(404);

        const result = await run(['__tests__/__fixtures__/docs/new-docs/new-doc.md', '--key', key, '--dry-run']);

        expect(result).toMatchSnapshot();
        expect(fs.writeFileSync).not.toHaveBeenCalled();

        mock.done();
      });

      it('should not update anything in ReadMe', async () => {
        const mock = getAPIv2Mock({ authorization }).get('/versions/stable/guides/some-slug').reply(200);

        const result = await run(['__tests__/__fixtures__/docs/slug-docs/new-doc-slug.md', '--key', key, '--dry-run']);

        expect(result).toMatchSnapshot();
        expect(fs.writeFileSync).not.toHaveBeenCalled();

        mock.done();
      });

      it('should error out if a non-404 error is returned from the GET request', async () => {
        const mock = getAPIv2Mock({ authorization }).get('/versions/stable/guides/some-slug').reply(500);

        const result = await run(['__tests__/__fixtures__/docs/slug-docs/new-doc-slug.md', '--key', key, '--dry-run']);

        expect(result).toMatchSnapshot();
        expect(fs.writeFileSync).not.toHaveBeenCalled();

        mock.done();
      });

      it('should error out if a non-404 error is returned from the GET request (with a json body)', async () => {
        const mock = getAPIv2Mock({ authorization }).get('/versions/stable/guides/some-slug').reply(500, {
          title: 'bad request',
          detail: 'something went so so wrong',
          status: 500,
        });

        const result = await run(['__tests__/__fixtures__/docs/slug-docs/new-doc-slug.md', '--key', key, '--dry-run']);

        expect(result).toMatchSnapshot();
        expect(fs.writeFileSync).not.toHaveBeenCalled();

        mock.done();
      });
    });

    describe('given that the slug is passed in the frontmatter', () => {
      it('should use that slug to create a page in ReadMe', async () => {
        const mock = getAPIv2Mock({ authorization })
          .get('/versions/stable/guides/some-slug')
          .reply(404)
          .post('/versions/stable/guides', {
            category: { uri: '/versions/stable/categories/guides/some-category-uri' },
            title: 'This is the document title',
            content: { body: '\nBody\n' },
            slug: 'some-slug',
          })
          .reply(201, {});

        const result = await run(['__tests__/__fixtures__/docs/slug-docs/new-doc-slug.md', '--key', key]);

        expect(result).toMatchSnapshot();
        expect(fs.writeFileSync).not.toHaveBeenCalled();

        mock.done();
      });

      it('should use that slug update an existing guides page in ReadMe', async () => {
        const mock = getAPIv2Mock({ authorization })
          .get('/versions/stable/guides/some-slug')
          .reply(200)
          .patch('/versions/stable/guides/some-slug', {
            category: { uri: '/versions/stable/categories/guides/some-category-uri' },
            title: 'This is the document title',
            content: { body: '\nBody\n' },
          })
          .reply(201, {});

        const result = await run(['__tests__/__fixtures__/docs/slug-docs/new-doc-slug.md', '--key', key]);

        expect(result).toMatchSnapshot();
        expect(fs.writeFileSync).not.toHaveBeenCalled();

        mock.done();
      });
    });

    describe('given that the file has frontmatter issues', () => {
      it('should fix the frontmatter issues in the file and create the corrected file in ReadMe', async () => {
        const mock = getAPIv2Mock({ authorization })
          .get('/versions/stable/guides/legacy-category')
          .reply(404)
          .post('/versions/stable/guides', {
            category: { uri: '/versions/stable/categories/guides/uri-that-does-not-map-to-5ae122e10fdf4e39bb34db6f' },
            slug: 'legacy-category',
            title: 'This is the document title',
            content: { body: '\nBody\n' },
          })
          .reply(201, {});

        prompts.inject([true]);

        const result = await run(['__tests__/__fixtures__/docs/mixed-docs/legacy-category.md', '--key', key]);

        expect(result).toMatchSnapshot();
        expect(fs.writeFileSync).toHaveBeenCalledWith(
          '__tests__/__fixtures__/docs/mixed-docs/legacy-category.md',
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
          .get('/versions/stable/guides/legacy-category')
          .reply(404)
          .post('/versions/stable/guides', {
            category: { uri: '/versions/stable/categories/guides/mapped-uri' },
            slug: 'legacy-category',
            title: 'This is the document title',
            content: { body: '\nBody\n' },
          })
          .reply(201, {});

        const projectsMeMock = getAPIv2Mock({ authorization }).get('/projects/me').reply(200, {
          data: {},
        });

        prompts.inject([true]);

        const result = await run(['__tests__/__fixtures__/docs/mixed-docs/legacy-category.md', '--key', key]);

        expect(result).toMatchSnapshot();
        expect(fs.writeFileSync).toHaveBeenCalledWith(
          '__tests__/__fixtures__/docs/mixed-docs/legacy-category.md',
          expect.stringContaining('uri: mapped-uri'),
          { encoding: 'utf-8' },
        );

        mappingsMock.done();
        mock.done();
        projectsMeMock.done();
      });

      it('should exit if the user declines to fix the issues', async () => {
        prompts.inject([false]);

        const result = await run(['__tests__/__fixtures__/docs/mixed-docs/legacy-category.md', '--key', key]);

        expect(result).toMatchSnapshot();
        expect(fs.writeFileSync).not.toHaveBeenCalled();
      });

      it('should skip client-side validation if the --skip-validation flag is passed', async () => {
        const mock = getAPIv2Mock({ authorization })
          .get('/versions/stable/guides/legacy-category')
          .reply(404)
          .post('/versions/stable/guides', {
            category: '5ae122e10fdf4e39bb34db6f',
            slug: 'legacy-category',
            title: 'This is the document title',
            content: { body: '\nBody\n' },
          })
          .reply(400, { title: 'bad request', detail: 'your category is whack' });

        const result = await run([
          '__tests__/__fixtures__/docs/mixed-docs/legacy-category.md',
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
          .get('/versions/stable/guides/invalid-attributes')
          .reply(404)
          .post('/versions/stable/guides', {
            category: {
              uri: '/versions/stable/categories/guides/some-category-uri',
              'is-this-a-valid-property': 'nope',
            },
            slug: 'invalid-attributes',
            title: 'This is the document title',
            content: { body: '\nBody\n' },
          })
          .reply(201, {});

        const result = await run(['__tests__/__fixtures__/docs/mixed-docs/invalid-attributes.md', '--key', key]);

        expect(result).toMatchSnapshot();
        expect(fs.writeFileSync).not.toHaveBeenCalled();

        mock.done();
      });
    });

    describe('and the command is being run in a CI environment', () => {
      beforeEach(githubActionsEnv.before);

      afterEach(githubActionsEnv.after);

      it('should create a guides page in ReadMe and include `x-readme-source-url` source header', async () => {
        const headMock = getAPIv2MockForGHA({ authorization }).get('/versions/stable/guides/new-doc').reply(404);

        const postMock = getAPIv2MockForGHA({
          authorization,
          'x-readme-source-url':
            'https://github.com/octocat/Hello-World/blob/ffac537e6cbbf934b08745a378932722df287a53/__tests__/__fixtures__/docs/new-docs/new-doc.md',
        })
          .post('/versions/stable/guides', {
            category: { uri: '/versions/stable/categories/guides/category-slug' },
            slug: 'new-doc',
            title: 'This is the document title',
            content: { body: '\nBody\n' },
          })
          .reply(201, {});

        const projectsMeMock = getAPIv2MockForGHA({ authorization }).get('/projects/me').reply(200, {
          data: {},
        });

        const result = await run(['__tests__/__fixtures__/docs/new-docs/new-doc.md', '--key', key]);

        expect(result).toMatchSnapshot();
        expect(fs.writeFileSync).not.toHaveBeenCalled();

        headMock.done();
        postMock.done();
        projectsMeMock.done();
      });

      it('should error out if the file has validation errors', async () => {
        const projectsMeMock = getAPIv2MockForGHA({ authorization }).get('/projects/me').reply(200, {
          data: {},
        });
        const result = await run(['__tests__/__fixtures__/docs/mixed-docs/legacy-category.md', '--key', key]);

        expect(result).toMatchSnapshot();
        expect(fs.writeFileSync).not.toHaveBeenCalled();
        projectsMeMock.done();
      });
    });

    it('should error out if a non-404 error is returned from the GET request', async () => {
      const mock = getAPIv2Mock({ authorization }).get('/versions/stable/guides/new-doc').reply(500);

      const result = await run(['__tests__/__fixtures__/docs/new-docs/new-doc.md', '--key', key]);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).not.toHaveBeenCalled();

      mock.done();
    });

    it('should error out if a non-404 error is returned from the GET request (with a json body)', async () => {
      const mock = getAPIv2Mock({ authorization }).get('/versions/stable/guides/new-doc').reply(500, {
        title: 'bad request',
        detail: 'something went so so wrong',
        status: 500,
      });

      const result = await run(['__tests__/__fixtures__/docs/new-docs/new-doc.md', '--key', key]);

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
    it('should create a guides page in ReadMe for each file in the directory and its subdirectories', async () => {
      const mock = getAPIv2Mock({ authorization })
        .get('/versions/stable/guides/simple-doc')
        .reply(404)
        .post('/versions/stable/guides', {
          slug: 'simple-doc',
          title: 'This is the document title',
          content: { body: '\nBody\n' },
        })
        .reply(201, {})
        .get('/versions/stable/guides/another-doc')
        .reply(404)
        .post('/versions/stable/guides', {
          slug: 'another-doc',
          title: 'This is another document title',
          content: { body: '\nAnother body\n' },
          category: { uri: '/versions/stable/categories/guides/category-slug' },
        })
        .reply(201, {});

      const result = await run(['__tests__/__fixtures__/docs/existing-docs', '--key', key]);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).not.toHaveBeenCalled();

      mock.done();
    });

    it('should update existing guides pages in ReadMe for each file in the directory and its subdirectories', async () => {
      const mock = getAPIv2Mock({ authorization })
        .get('/versions/stable/guides/simple-doc')
        .reply(200)
        .patch('/versions/stable/guides/simple-doc', {
          title: 'This is the document title',
          content: { body: '\nBody\n' },
        })
        .reply(201, {})
        .get('/versions/stable/guides/another-doc')
        .reply(200)
        .patch('/versions/stable/guides/another-doc', {
          title: 'This is another document title',
          category: { uri: '/versions/stable/categories/guides/category-slug' },
          content: { body: '\nAnother body\n' },
        })
        .reply(201, {});

      const result = await run(['__tests__/__fixtures__/docs/existing-docs', '--key', key]);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).not.toHaveBeenCalled();

      mock.done();
    });

    it('should handle complex frontmatter', async () => {
      const mock = getAPIv2Mock({ authorization })
        .get('/versions/stable/guides/basic')
        .reply(200)
        .patch('/versions/stable/guides/basic', {
          title: 'This is the document title',
          category: { uri: '/versions/stable/categories/guides/category-slug' },
          content: { body: 'frontmatter body', excerpt: 'frontmatter excerpt' },
          type: 'basic',
        })
        .reply(201, {})
        .get('/versions/stable/guides/link')
        .reply(200)
        .patch('/versions/stable/guides/link', {
          title: 'This is the document title',
          category: { uri: '/versions/stable/categories/guides/category-slug' },
          content: {
            body: '\nBody\n',
            excerpt: 'frontmatter excerpt',
            link: { url: 'https://example.com', new_tab: true },
          },
          type: 'link',
        })
        .reply(201, {});

      const result = await run(['__tests__/__fixtures__/docs/complex-frontmatter', '--key', key]);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).not.toHaveBeenCalled();

      mock.done();
    });

    describe('given that the directory contains parent/child docs', () => {
      it('should upload parents before children', async () => {
        const mock = getAPIv2Mock({ authorization })
          .get('/versions/stable/guides/child')
          .reply(404)
          .post('/versions/stable/guides', {
            slug: 'child',
            title: 'Child',
            parent: { uri: '/versions/stable/guides/parent' },
            content: { body: '\nBody\n' },
          })
          .reply(201, {})
          .get('/versions/stable/guides/friend')
          .reply(404)
          .post('/versions/stable/guides', {
            slug: 'friend',
            title: 'Friend',
            content: { body: '\nBody\n' },
          })
          .reply(201, {})
          .get('/versions/stable/guides/parent')
          .reply(404)
          .post('/versions/stable/guides', {
            slug: 'parent',
            title: 'Parent',
            parent: { uri: '/versions/stable/guides/grandparent' },
            content: { body: '\nBody\n' },
          })
          .reply(201, {})
          .get('/versions/stable/guides/grandparent')
          .reply(404)
          .post('/versions/stable/guides', {
            slug: 'grandparent',
            title: 'Grandparent',
            content: { body: '\nBody\n' },
          })
          .reply(201, {});

        const result = await run(['__tests__/__fixtures__/docs/multiple-docs', '--key', key]);

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
        .get('/versions/stable/guides/invalid-attributes')
        .reply(404)
        .post('/versions/stable/guides', {
          category: { uri: '/versions/stable/categories/guides/some-category-uri', 'is-this-a-valid-property': 'nope' },
          slug: 'invalid-attributes',
          title: 'This is the document title',
          content: { body: '\nBody\n' },
        })
        .reply(201, {})
        .get('/versions/stable/guides/legacy-category')
        .reply(200)
        .patch('/versions/stable/guides/legacy-category', {
          category: { uri: '/versions/stable/categories/guides/uri-that-does-not-map-to-5ae122e10fdf4e39bb34db6f' },
          title: 'This is the document title',
          content: { body: '\nBody\n' },
        })
        .reply(201, {})
        .get('/versions/stable/guides/some-slug')
        .reply(404)
        .post('/versions/stable/guides', {
          slug: 'some-slug',
          title: 'This is the document title',
          category: { uri: '/versions/stable/categories/guides/some-category-uri' },
          content: { body: '\nBody\n' },
        })
        .reply(500, {})
        .get('/versions/stable/guides/simple-doc')
        .reply(404)
        .post('/versions/stable/guides', {
          slug: 'simple-doc',
          title: 'This is the document title',
          content: { body: '\nBody\n' },
        })
        .reply(500, {});

      prompts.inject([true]);

      const result = await run(['__tests__/__fixtures__/docs/mixed-docs', '--key', key]);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).toHaveBeenCalledTimes(5);

      mock.done();
    });

    it('should handle a mix of creates and updates and failures and skipped files (dry run)', async () => {
      const mock = getAPIv2Mock({ authorization })
        .get('/versions/stable/guides/invalid-attributes')
        .reply(404)
        .get('/versions/stable/guides/legacy-category')
        .reply(200)
        .get('/versions/stable/guides/some-slug')
        .reply(500)
        .get('/versions/stable/guides/simple-doc')
        .reply(500);

      prompts.inject([true]);

      const result = await run(['__tests__/__fixtures__/docs/mixed-docs', '--key', key, '--dry-run']);

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

      const result = await run(['__tests__/__fixtures__/docs/new-docs/new-doc.md', '--key', key]);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).not.toHaveBeenCalled();

      mock.done();
    });

    it('should upload if validation is skipped', async () => {
      nock.cleanAll();

      const mock = getAPIv2Mock({ authorization })
        .get('/versions/1.2.3/guides/new-doc')
        .reply(404)
        .post('/versions/1.2.3/guides', {
          category: { uri: '/versions/1.2.3/categories/guides/category-slug' },
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
        '__tests__/__fixtures__/docs/new-docs/new-doc.md',
        '--key',
        key,
        '--version',
        '1.2.3',
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

      const result = await run(['__tests__/__fixtures__/docs/new-docs/new-doc.md', '--key', 'bad-api-key']);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).not.toHaveBeenCalled();

      mock.done();
    });
  });
});
