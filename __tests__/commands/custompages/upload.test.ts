import fs from 'node:fs';

import prompts from 'prompts';
import { describe, afterEach, it, expect, beforeAll, beforeEach, vi } from 'vitest';

import CustomPagesCommand from '../../../src/commands/custompages/upload.js';
import { getAPIv1Mock, getAPIv2Mock, getAPIv2MockForGHA } from '../../helpers/get-api-mock.js';
import { githubActionsEnv } from '../../helpers/git-mock.js';
import { runCommand, type OclifOutput } from '../../helpers/oclif.js';

const key = 'rdme_123';
const authorization = `Bearer ${key}`;

describe('custompages upload', () => {
  let run: (args?: string[]) => OclifOutput;

  beforeAll(() => {
    run = runCommand(CustomPagesCommand);
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
        .get('/branches/stable/custom_pages/new-doc')
        .reply(404)
        .post('/branches/stable/custom_pages', {
          slug: 'new-doc',
          title: 'This is the document title',
          content: { body: '\nBody\n', type: 'markdown' },
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
          slug: 'new-doc',
          title: 'This is the document title',
          content: { body: '\nBody\n', type: 'markdown' },
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
          slug: 'new-doc',
          title: 'This is the document title',
          content: { body: '\nBody\n', type: 'markdown' },
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
          slug: 'new-doc',
          title: 'This is the document title',
          content: { body: '\nBody\n', type: 'markdown' },
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
            title: 'This is the document title',
            content: { body: '\nBody\n', type: 'markdown' },
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
            title: 'This is the document title',
            content: { body: '\nBody\n', type: 'markdown' },
          })
          .reply(201, {});

        const result = await run(['__tests__/__fixtures__/custompages/slug-docs/new-doc-slug.md', '--key', key]);

        expect(result).toMatchSnapshot();
        expect(fs.writeFileSync).not.toHaveBeenCalled();

        mock.done();
      });
    });

    describe('given that the file has frontmatter issues', () => {
      it('should fix the frontmatter issues in the file', async () => {
        prompts.inject([true]);

        const result = await run(['__tests__/__fixtures__/custompages/mixed-docs/legacy-page.md', '--key', key]);

        expect(result).toMatchSnapshot();
        expect(fs.writeFileSync).toHaveBeenCalledWith(
          '__tests__/__fixtures__/custompages/mixed-docs/legacy-page.md',
          expect.stringContaining('view: anyone_with_link'),
          { encoding: 'utf-8' },
        );
      });

      it('should exit if the user declines to fix the issues', async () => {
        prompts.inject([false]);

        const result = await run(['__tests__/__fixtures__/custompages/mixed-docs/legacy-page.md', '--key', key]);

        expect(result).toMatchSnapshot();
        expect(fs.writeFileSync).not.toHaveBeenCalled();
      });

      it('should skip client-side validation if the --skip-validation flag is passed', async () => {
        const mock = getAPIv2Mock({ authorization })
          .get('/branches/stable/custom_pages/legacy-page')
          .reply(404)
          .post('/branches/stable/custom_pages', {
            fullscreen: true,
            hidden: true,
            slug: 'legacy-page',
            title: 'This is the document title',
            content: { body: '\nBody\n', type: 'markdown' },
          })
          .reply(400, { title: 'bad request', detail: 'your metadata is whack' });

        const result = await run([
          '__tests__/__fixtures__/custompages/mixed-docs/legacy-page.md',
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
            appearance: { 'is-this-a-valid-property': 'nope' },
            slug: 'invalid-attributes',
            title: 'This is the document title',
            content: { body: '\nBody\n', type: 'markdown' },
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
            slug: 'new-doc',
            title: 'This is the document title',
            content: { body: '\nBody\n', type: 'markdown' },
          })
          .reply(201, {});

        const result = await run(['__tests__/__fixtures__/custompages/new-docs/new-doc.md', '--key', key]);

        expect(result).toMatchSnapshot();
        expect(fs.writeFileSync).not.toHaveBeenCalled();

        getMock.done();
        postMock.done();
      });

      it('should error out if the file has validation errors', async () => {
        const result = await run(['__tests__/__fixtures__/custompages/mixed-docs/legacy-page.md', '--key', key]);

        expect(result).toMatchSnapshot();
        expect(fs.writeFileSync).not.toHaveBeenCalled();
      });

      it('should bypass prompt if `--confirm-autofixes` flag is passed', async () => {
        const result = await run([
          '__tests__/__fixtures__/custompages/mixed-docs/legacy-page.md',
          '--key',
          key,
          '--confirm-autofixes',
        ]);

        expect(result).toMatchSnapshot();
        expect(fs.writeFileSync).toHaveBeenCalledWith(
          '__tests__/__fixtures__/custompages/mixed-docs/legacy-page.md',
          expect.stringContaining('view: anyone_with_link'),
          { encoding: 'utf-8' },
        );
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
          content: { body: '\nBody\n', type: 'markdown' },
        })
        .reply(201, {})
        .get('/branches/stable/custom_pages/another-doc')
        .reply(404)
        .post('/branches/stable/custom_pages', {
          slug: 'another-doc',
          title: 'This is another document title',
          content: { body: '\nAnother body\n', type: 'markdown' },
        })
        .reply(201, {})
        .get('/branches/stable/custom_pages/html-file')
        .reply(404)
        .post('/branches/stable/custom_pages', {
          slug: 'html-file',
          title: 'This is another document title',
          content: {
            body: '\n<h1>Here we have an HTML file</h1>\n<p>This is a paragraph in an HTML file.</p>\n',
            type: 'html',
          },
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
          content: { body: '\nBody\n', type: 'markdown' },
        })
        .reply(201, {})
        .get('/branches/stable/custom_pages/another-doc')
        .reply(200)
        .patch('/branches/stable/custom_pages/another-doc', {
          title: 'This is another document title',
          content: { body: '\nAnother body\n', type: 'markdown' },
        })
        .reply(201, {})
        .get('/branches/stable/custom_pages/html-file')
        .reply(200)
        .patch('/branches/stable/custom_pages/html-file', {
          title: 'This is another document title',
          content: {
            body: '\n<h1>Here we have an HTML file</h1>\n<p>This is a paragraph in an HTML file.</p>\n',
            type: 'html',
          },
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
          content: { body: 'frontmatter body', type: 'markdown' },
        })
        .reply(201, {})
        .get('/branches/stable/custom_pages/complex')
        .reply(200)
        .patch('/branches/stable/custom_pages/complex', {
          title: 'This is the document title',
          content: {
            body: '\nBody\n',
            type: 'markdown',
          },
          appearance: {
            fullscreen: true,
          },
          metadata: {
            description: 'A description',
            keywords: 'something, another',
            title: 'document',
          },
          privacy: { view: 'public' },
        })
        .reply(201, {});

      const result = await run(['__tests__/__fixtures__/custompages/complex-frontmatter', '--key', key]);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).not.toHaveBeenCalled();

      mock.done();
    });

    it('should error out if the directory does not contain any Markdown or HTML files', async () => {
      const result = await run(['__tests__/__fixtures__/ref-oas', '--key', key]);

      expect(result).toMatchSnapshot();
    });

    it('should handle a mix of valid and invalid and autofixable files', async () => {
      prompts.inject([true]);

      const result = await run(['__tests__/__fixtures__/custompages/mixed-docs', '--key', key]);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).toHaveBeenCalledTimes(5);
    });

    it('should handle a mix of creates and updates and failures and skipped files', async () => {
      const mock = getAPIv2Mock({ authorization })
        .get('/branches/stable/custom_pages/invalid-attributes')
        .reply(404)
        .post('/branches/stable/custom_pages', {
          appearance: { 'is-this-a-valid-property': 'nope' },
          slug: 'invalid-attributes',
          title: 'This is the document title',
          content: { body: '\nBody\n', type: 'markdown' },
        })
        .reply(201, {})
        .get('/branches/stable/custom_pages/legacy-page')
        .reply(200)
        .patch('/branches/stable/custom_pages/legacy-page', {
          title: 'This is the document title',
          content: { body: '\nBody\n', type: 'markdown' },
          hidden: true,
          fullscreen: true,
        })
        .reply(201, {})
        .get('/branches/stable/custom_pages/some-slug')
        .reply(404)
        .post('/branches/stable/custom_pages', {
          slug: 'some-slug',
          title: 'This is the document title',
          content: { body: '\nBody\n', type: 'markdown' },
        })
        .reply(500, {})
        .get('/branches/stable/custom_pages/simple-doc')
        .reply(404)
        .post('/branches/stable/custom_pages', {
          slug: 'simple-doc',
          title: 'This is the document title',
          content: { body: '\nBody\n', type: 'markdown' },
        })
        .reply(500, {});

      const result = await run(['__tests__/__fixtures__/custompages/mixed-docs', '--key', key, '--skip-validation']);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).not.toHaveBeenCalled();

      mock.done();
    });

    it('should handle a mix of creates and updates and failures and skipped files and not error out with `max-errors` flag', async () => {
      const mock = getAPIv2Mock({ authorization })
        .get('/branches/stable/custom_pages/invalid-attributes')
        .reply(404)
        .post('/branches/stable/custom_pages', {
          appearance: { 'is-this-a-valid-property': 'nope' },
          slug: 'invalid-attributes',
          title: 'This is the document title',
          content: { body: '\nBody\n', type: 'markdown' },
        })
        .reply(201, {})
        .get('/branches/stable/custom_pages/legacy-page')
        .reply(200)
        .patch('/branches/stable/custom_pages/legacy-page', {
          title: 'This is the document title',
          content: { body: '\nBody\n', type: 'markdown' },
          hidden: true,
          fullscreen: true,
        })
        .reply(201, {})
        .get('/branches/stable/custom_pages/some-slug')
        .reply(404)
        .post('/branches/stable/custom_pages', {
          slug: 'some-slug',
          title: 'This is the document title',
          content: { body: '\nBody\n', type: 'markdown' },
        })
        .reply(500, {})
        .get('/branches/stable/custom_pages/simple-doc')
        .reply(404)
        .post('/branches/stable/custom_pages', {
          slug: 'simple-doc',
          title: 'This is the document title',
          content: { body: '\nBody\n', type: 'markdown' },
        })
        .reply(500, {});

      const result = await run([
        '__tests__/__fixtures__/custompages/mixed-docs',
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
        .get('/branches/stable/custom_pages/invalid-attributes')
        .reply(404)
        .get('/branches/stable/custom_pages/legacy-page')
        .reply(200)
        .get('/branches/stable/custom_pages/some-slug')
        .reply(500)
        .get('/branches/stable/custom_pages/simple-doc')
        .reply(500);

      const result = await run([
        '__tests__/__fixtures__/custompages/mixed-docs',
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
