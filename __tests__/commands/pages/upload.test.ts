import fs from 'node:fs';

import nock from 'nock';
import prompts from 'prompts';
import { describe, afterEach, it, expect, beforeAll, beforeEach, vi } from 'vitest';

import GuidesCommand from '../../../src/commands/docs/upload.js';
import ReferenceCommand from '../../../src/commands/reference/upload.js';
import { getAPIv1Mock, getAPIv2Mock, getAPIv2MockForGHA } from '../../helpers/get-api-mock.js';
import { githubActionsEnv } from '../../helpers/git-mock.js';
import { runCommand, type OclifOutput } from '../../helpers/oclif.js';

const key = 'rdme_123';
const authorization = `Bearer ${key}`;

describe.each([
  ['docs', GuidesCommand, 'guides'],
  ['reference', ReferenceCommand, 'reference'],
] as const)('rdme %s upload', (topic, Command, route) => {
  let run: (args?: string[]) => OclifOutput;

  beforeAll(() => {
    run = runCommand(Command);
  });

  beforeEach(() => {
    getAPIv1Mock().get('/api/v1/migration').basicAuth({ user: key }).reply(201, {
      categories: {},
      parentPages: {},
    });
    vi.spyOn(fs, 'writeFileSync').mockImplementation((file, data) => {
      // eslint-disable-next-line no-console
      console.log(`=== BEGIN writeFileSync to file: ${file} ===`);
      // eslint-disable-next-line no-console
      console.log(data);
      // eslint-disable-next-line no-console
      console.log(`=== END writeFileSync to file: ${file} ===`);
    });
  });

  afterEach(() => {
    prompts.override({});
    vi.restoreAllMocks();
  });

  describe('given that the file path is a single file', () => {
    it('should create a page in ReadMe', async () => {
      const mock = getAPIv2Mock({ authorization })
        .get(`/branches/stable/${route}/new-doc`)
        .reply(404)
        .post(`/branches/stable/${route}`, {
          category: { uri: `/branches/stable/categories/${route}/category-slug` },
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
        .get(`/branches/stable/${route}/new-doc`)
        .reply(404)
        .post(`/branches/stable/${route}`, {
          category: { uri: `/branches/stable/categories/${route}/category-slug` },
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

    it('should allow for user to specify branch via --branch flag', async () => {
      const mock = getAPIv2Mock({ authorization })
        .get(`/branches/1.2.3/${route}/new-doc`)
        .reply(404)
        .post(`/branches/1.2.3/${route}`, {
          category: { uri: `/branches/1.2.3/categories/${route}/category-slug` },
          slug: 'new-doc',
          title: 'This is the document title',
          content: { body: '\nBody\n' },
        })
        .reply(201, {});

      const result = await run(['__tests__/__fixtures__/docs/new-docs/new-doc.md', '--key', key, '--branch', '1.2.3']);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).not.toHaveBeenCalled();

      mock.done();
    });

    it('should allow for user to specify branch via legacy --version flag', async () => {
      const mock = getAPIv2Mock({ authorization })
        .get(`/branches/4.5.6/${route}/new-doc`)
        .reply(404)
        .post(`/branches/4.5.6/${route}`, {
          category: { uri: `/branches/4.5.6/categories/${route}/category-slug` },
          slug: 'new-doc',
          title: 'This is the document title',
          content: { body: '\nBody\n' },
        })
        .reply(201, {});

      const result = await run(['__tests__/__fixtures__/docs/new-docs/new-doc.md', '--key', key, '--version', '4.5.6']);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).not.toHaveBeenCalled();

      mock.done();
    });

    describe('given that the --dry-run flag is passed', () => {
      it('should not create anything in ReadMe', async () => {
        const mock = getAPIv2Mock({ authorization }).get(`/branches/stable/${route}/new-doc`).reply(404);

        const result = await run(['__tests__/__fixtures__/docs/new-docs/new-doc.md', '--key', key, '--dry-run']);

        expect(result).toMatchSnapshot();
        expect(fs.writeFileSync).not.toHaveBeenCalled();

        mock.done();
      });

      it('should not update anything in ReadMe', async () => {
        const mock = getAPIv2Mock({ authorization }).get(`/branches/stable/${route}/some-slug`).reply(200);

        const result = await run(['__tests__/__fixtures__/docs/slug-docs/new-doc-slug.md', '--key', key, '--dry-run']);

        expect(result).toMatchSnapshot();
        expect(fs.writeFileSync).not.toHaveBeenCalled();

        mock.done();
      });

      it('should error out if a non-404 error is returned from the GET request', async () => {
        const mock = getAPIv2Mock({ authorization }).get(`/branches/stable/${route}/some-slug`).reply(500);

        const result = await run(['__tests__/__fixtures__/docs/slug-docs/new-doc-slug.md', '--key', key, '--dry-run']);

        expect(result).toMatchSnapshot();
        expect(fs.writeFileSync).not.toHaveBeenCalled();

        mock.done();
      });

      it('should error out if a non-404 error is returned from the GET request (with a json body)', async () => {
        const mock = getAPIv2Mock({ authorization }).get(`/branches/stable/${route}/some-slug`).reply(500, {
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
          .get(`/branches/stable/${route}/some-slug`)
          .reply(404)
          .post(`/branches/stable/${route}`, {
            category: { uri: `/branches/stable/categories/${route}/some-category-uri` },
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

      it('should use that slug update an existing page in ReadMe', async () => {
        const mock = getAPIv2Mock({ authorization })
          .get(`/branches/stable/${route}/some-slug`)
          .reply(200)
          .patch(`/branches/stable/${route}/some-slug`, {
            category: { uri: `/branches/stable/categories/${route}/some-category-uri` },
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
      it('should fix the frontmatter issues in the file', async () => {
        prompts.inject([true]);

        const result = await run(['__tests__/__fixtures__/docs/mixed-docs/legacy-category.md', '--key', key]);

        expect(result).toMatchSnapshot();
        expect(fs.writeFileSync).toHaveBeenCalledWith(
          '__tests__/__fixtures__/docs/mixed-docs/legacy-category.md',
          expect.stringContaining('uri: uri-that-does-not-map-to-5ae122e10fdf4e39bb34db6f'),
          { encoding: 'utf-8' },
        );
      });

      it('should fix the frontmatter issues in the file and insert the proper category mapping', async () => {
        nock.cleanAll();
        const mappingsMock = getAPIv1Mock()
          .get('/api/v1/migration')
          .basicAuth({ user: key })
          .reply(201, {
            categories: { '5ae122e10fdf4e39bb34db6f': 'mapped-uri' },
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
      });

      it('should exit if the user declines to fix the issues', async () => {
        prompts.inject([false]);

        const result = await run(['__tests__/__fixtures__/docs/mixed-docs/legacy-category.md', '--key', key]);

        expect(result).toMatchSnapshot();
        expect(fs.writeFileSync).not.toHaveBeenCalled();
      });

      it('should skip client-side validation if the --skip-validation flag is passed', async () => {
        const mock = getAPIv2Mock({ authorization })
          .get(`/branches/stable/${route}/legacy-category`)
          .reply(404)
          .post(`/branches/stable/${route}`, {
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
          .get(`/branches/stable/${route}/invalid-attributes`)
          .reply(404)
          .post(`/branches/stable/${route}`, {
            category: {
              uri: `/branches/stable/categories/${route}/some-category-uri`,
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

      it('should create a page in ReadMe and include `x-readme-source-url` source header', async () => {
        const getMock = getAPIv2MockForGHA({ authorization }).get(`/branches/stable/${route}/new-doc`).reply(404);

        const postMock = getAPIv2MockForGHA({
          authorization,
          'x-readme-source-url':
            'https://github.com/octocat/Hello-World/blob/ffac537e6cbbf934b08745a378932722df287a53/__tests__/__fixtures__/docs/new-docs/new-doc.md',
        })
          .post(`/branches/stable/${route}`, {
            category: { uri: `/branches/stable/categories/${route}/category-slug` },
            slug: 'new-doc',
            title: 'This is the document title',
            content: { body: '\nBody\n' },
          })
          .reply(201, {});

        const result = await run(['__tests__/__fixtures__/docs/new-docs/new-doc.md', '--key', key]);

        expect(result).toMatchSnapshot();
        expect(fs.writeFileSync).not.toHaveBeenCalled();

        getMock.done();
        postMock.done();
      });

      it('should error out if the file has validation errors', async () => {
        const result = await run(['__tests__/__fixtures__/docs/mixed-docs/legacy-category.md', '--key', key]);

        expect(result).toMatchSnapshot();
        expect(fs.writeFileSync).not.toHaveBeenCalled();
      });

      it('should bypass prompt if `--confirm-autofixes` flag is passed', async () => {
        const result = await run([
          '__tests__/__fixtures__/docs/mixed-docs/legacy-category.md',
          '--key',
          key,
          '--confirm-autofixes',
        ]);

        expect(result).toMatchSnapshot();
        expect(fs.writeFileSync).toHaveBeenCalledWith(
          '__tests__/__fixtures__/docs/mixed-docs/legacy-category.md',
          expect.stringContaining('uri: uri-that-does-not-map-to-5ae122e10fdf4e39bb34db6f'),
          { encoding: 'utf-8' },
        );
      });
    });

    it('should error out if a non-404 error is returned from the GET request', async () => {
      const mock = getAPIv2Mock({ authorization }).get(`/branches/stable/${route}/new-doc`).reply(500);

      const result = await run(['__tests__/__fixtures__/docs/new-docs/new-doc.md', '--key', key]);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).not.toHaveBeenCalled();

      mock.done();
    });

    it('should error out if a non-404 error is returned from the GET request (with a json body)', async () => {
      const mock = getAPIv2Mock({ authorization }).get(`/branches/stable/${route}/new-doc`).reply(500, {
        title: 'bad request',
        detail: 'something went so so wrong',
        status: 500,
      });

      const result = await run(['__tests__/__fixtures__/docs/new-docs/new-doc.md', '--key', key]);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).not.toHaveBeenCalled();

      mock.done();
    });

    it('should not throw an error if `max-errors` flag is set to -1', async () => {
      const mock = getAPIv2Mock({ authorization }).get(`/branches/stable/${route}/new-doc`).reply(500, {
        title: 'bad request',
        detail: 'something went so so wrong',
        status: 500,
      });

      const result = await run(['__tests__/__fixtures__/docs/new-docs/new-doc.md', '--key', key, '--max-errors', '-1']);

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
        .get(`/branches/stable/${route}/simple-doc`)
        .reply(404)
        .post(`/branches/stable/${route}`, {
          slug: 'simple-doc',
          title: 'This is the document title',
          content: { body: '\nBody\n' },
        })
        .reply(201, {})
        .get(`/branches/stable/${route}/another-doc`)
        .reply(404)
        .post(`/branches/stable/${route}`, {
          slug: 'another-doc',
          title: 'This is another document title',
          content: { body: '\nAnother body\n' },
          category: { uri: `/branches/stable/categories/${route}/category-slug` },
        })
        .reply(201, {});

      const result = await run([`__tests__/__fixtures__/${topic}/existing-docs`, '--key', key]);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).not.toHaveBeenCalled();

      mock.done();
    });

    it('should update existing pages in ReadMe for each file in the directory and its subdirectories', async () => {
      const mock = getAPIv2Mock({ authorization })
        .get(`/branches/stable/${route}/simple-doc`)
        .reply(200)
        .patch(`/branches/stable/${route}/simple-doc`, {
          title: 'This is the document title',
          content: { body: '\nBody\n' },
        })
        .reply(201, {})
        .get(`/branches/stable/${route}/another-doc`)
        .reply(200)
        .patch(`/branches/stable/${route}/another-doc`, {
          title: 'This is another document title',
          category: { uri: `/branches/stable/categories/${route}/category-slug` },
          content: { body: '\nAnother body\n' },
        })
        .reply(201, {});

      const result = await run([`__tests__/__fixtures__/${topic}/existing-docs`, '--key', key]);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).not.toHaveBeenCalled();

      mock.done();
    });

    it('should handle complex frontmatter', async () => {
      const mock = getAPIv2Mock({ authorization })
        .get(`/branches/stable/${route}/basic`)
        .reply(200)
        .patch(`/branches/stable/${route}/basic`, {
          title: 'This is the document title',
          category: { uri: `/branches/stable/categories/${route}/category-slug` },
          content: { body: 'frontmatter body', excerpt: 'frontmatter excerpt' },
          type: 'basic',
        })
        .reply(201, {})
        .get(`/branches/stable/${route}/link`)
        .reply(200)
        .patch(`/branches/stable/${route}/link`, {
          title: 'This is the document title',
          category: { uri: `/branches/stable/categories/${route}/category-slug` },
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
          .get(`/branches/stable/${route}/child`)
          .reply(404)
          .post(`/branches/stable/${route}`, {
            slug: 'child',
            title: 'Child',
            parent: { uri: `/branches/stable/${route}/parent` },
            content: { body: '\nBody\n' },
          })
          .reply(201, {})
          .get(`/branches/stable/${route}/friend`)
          .reply(404)
          .post(`/branches/stable/${route}`, {
            slug: 'friend',
            title: 'Friend',
            content: { body: '\nBody\n' },
          })
          .reply(201, {})
          .get(`/branches/stable/${route}/parent`)
          .reply(404)
          .post(`/branches/stable/${route}`, {
            slug: 'parent',
            title: 'Parent',
            parent: { uri: `/branches/stable/${route}/grandparent` },
            content: { body: '\nBody\n' },
          })
          .reply(201, {})
          .get(`/branches/stable/${route}/grandparent`)
          .reply(404)
          .post(`/branches/stable/${route}`, {
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

    it('should handle a mix of valid and invalid and autofixable files', async () => {
      prompts.inject([true]);

      const result = await run(['__tests__/__fixtures__/docs/mixed-docs', '--key', key]);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).toHaveBeenCalledTimes(5);
    });

    it('should handle a mix of creates and updates and failures and skipped files', async () => {
      const mock = getAPIv2Mock({ authorization })
        .get(`/branches/stable/${route}/invalid-attributes`)
        .reply(404)
        .post(`/branches/stable/${route}`, {
          category: {
            uri: `/branches/stable/categories/${route}/some-category-uri`,
            'is-this-a-valid-property': 'nope',
          },
          slug: 'invalid-attributes',
          title: 'This is the document title',
          content: { body: '\nBody\n' },
        })
        .reply(201, {})
        .get(`/branches/stable/${route}/legacy-category`)
        .reply(200)
        .patch(`/branches/stable/${route}/legacy-category`, {
          category: '5ae122e10fdf4e39bb34db6f',
          title: 'This is the document title',
          content: { body: '\nBody\n' },
        })
        .reply(201, {})
        .get(`/branches/stable/${route}/some-slug`)
        .reply(404)
        .post(`/branches/stable/${route}`, {
          slug: 'some-slug',
          title: 'This is the document title',
          category: { uri: `/branches/stable/categories/${route}/some-category-uri` },
          content: { body: '\nBody\n' },
        })
        .reply(500, {})
        .get(`/branches/stable/${route}/simple-doc`)
        .reply(404)
        .post(`/branches/stable/${route}`, {
          slug: 'simple-doc',
          title: 'This is the document title',
          content: { body: '\nBody\n' },
        })
        .reply(500, {});

      const result = await run(['__tests__/__fixtures__/docs/mixed-docs', '--key', key, '--skip-validation']);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).not.toHaveBeenCalled();

      mock.done();
    });

    it('should handle a mix of creates and updates and failures and skipped files and not error out with `max-errors` flag', async () => {
      const mock = getAPIv2Mock({ authorization })
        .get(`/branches/stable/${route}/invalid-attributes`)
        .reply(404)
        .post(`/branches/stable/${route}`, {
          category: {
            uri: `/branches/stable/categories/${route}/some-category-uri`,
            'is-this-a-valid-property': 'nope',
          },
          slug: 'invalid-attributes',
          title: 'This is the document title',
          content: { body: '\nBody\n' },
        })
        .reply(201, {})
        .get(`/branches/stable/${route}/legacy-category`)
        .reply(200)
        .patch(`/branches/stable/${route}/legacy-category`, {
          category: '5ae122e10fdf4e39bb34db6f',
          title: 'This is the document title',
          content: { body: '\nBody\n' },
        })
        .reply(201, {})
        .get(`/branches/stable/${route}/some-slug`)
        .reply(404)
        .post(`/branches/stable/${route}`, {
          slug: 'some-slug',
          title: 'This is the document title',
          category: { uri: `/branches/stable/categories/${route}/some-category-uri` },
          content: { body: '\nBody\n' },
        })
        .reply(500, {})
        .get(`/branches/stable/${route}/simple-doc`)
        .reply(404)
        .post(`/branches/stable/${route}`, {
          slug: 'simple-doc',
          title: 'This is the document title',
          content: { body: '\nBody\n' },
        })
        .reply(500, {});

      const result = await run([
        '__tests__/__fixtures__/docs/mixed-docs',
        '--key',
        key,
        '--max-errors',
        '10',
        '--skip-validation',
      ]);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).not.toHaveBeenCalled();

      mock.done();
    });

    it('should handle a mix of creates and updates and failures and skipped files (dry run)', async () => {
      const mock = getAPIv2Mock({ authorization })
        .get(`/branches/stable/${route}/invalid-attributes`)
        .reply(404)
        .get(`/branches/stable/${route}/legacy-category`)
        .reply(200)
        .get(`/branches/stable/${route}/some-slug`)
        .reply(500)
        .get(`/branches/stable/${route}/simple-doc`)
        .reply(500);

      const result = await run([
        '__tests__/__fixtures__/docs/mixed-docs',
        '--key',
        key,
        '--dry-run',
        '--skip-validation',
      ]);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).not.toHaveBeenCalled();

      mock.done();
    });
  });
});
