import fs from 'node:fs';

import nock from 'nock';
import prompts from 'prompts';
import { describe, afterEach, it, expect, beforeAll, beforeEach, vi } from 'vitest';

import Command from '../../../src/commands/changelog/upload.js';
import { getAPIv1Mock, getAPIv2Mock, getAPIv2MockForGHA } from '../../helpers/get-api-mock.js';
import { githubActionsEnv } from '../../helpers/git-mock.js';
import { runCommand, type OclifOutput } from '../../helpers/oclif.js';

const key = 'rdme_123';
const authorization = `Bearer ${key}`;

const route = 'changelogs';
const topic = 'changelog';

describe(`rdme ${topic} upload`, () => {
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
    prompts.override({});
    vi.restoreAllMocks();
  });

  describe('given that the file path is a single file', () => {
    it('should create a page in ReadMe', async () => {
      const mock = getAPIv2Mock({ authorization })
        .get(`/${route}/new-doc`)
        .reply(404)
        .post(`/${route}`, {
          type: 'added',
          slug: 'new-doc',
          title: 'This is the changelog title',
          content: { body: '\nBody\n' },
        })
        .reply(201, {});

      const result = await run(['__tests__/__fixtures__/changelog/new-docs/new-doc.md', '--key', key]);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).not.toHaveBeenCalled();

      mock.done();
    });

    it('should hide the warning if the `--hide-experimental-warning` flag is passed', async () => {
      const mock = getAPIv2Mock({ authorization })
        .get(`/${route}/new-doc`)
        .reply(404)
        .post(`/${route}`, {
          type: 'added',
          slug: 'new-doc',
          title: 'This is the changelog title',
          content: { body: '\nBody\n' },
        })
        .reply(201, {});

      const result = await run([
        '__tests__/__fixtures__/changelog/new-docs/new-doc.md',
        '--key',
        key,
        '--hide-experimental-warning',
      ]);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).not.toHaveBeenCalled();

      mock.done();
    });

    describe('given that the --dry-run flag is passed', () => {
      it('should not create anything in ReadMe', async () => {
        const mock = getAPIv2Mock({ authorization }).get(`/${route}/new-doc`).reply(404);

        const result = await run(['__tests__/__fixtures__/changelog/new-docs/new-doc.md', '--key', key, '--dry-run']);

        expect(result).toMatchSnapshot();
        expect(fs.writeFileSync).not.toHaveBeenCalled();

        mock.done();
      });

      it('should not update anything in ReadMe', async () => {
        const mock = getAPIv2Mock({ authorization }).get(`/${route}/some-slug`).reply(200);

        const result = await run([
          '__tests__/__fixtures__/changelog/slug-docs/new-doc-slug.md',
          '--key',
          key,
          '--dry-run',
        ]);

        expect(result).toMatchSnapshot();
        expect(fs.writeFileSync).not.toHaveBeenCalled();

        mock.done();
      });

      it('should error out if a non-404 error is returned from the GET request', async () => {
        const mock = getAPIv2Mock({ authorization }).get(`/${route}/some-slug`).reply(500);

        const result = await run([
          '__tests__/__fixtures__/changelog/slug-docs/new-doc-slug.md',
          '--key',
          key,
          '--dry-run',
        ]);

        expect(result).toMatchSnapshot();
        expect(fs.writeFileSync).not.toHaveBeenCalled();

        mock.done();
      });

      it('should error out if a non-404 error is returned from the GET request (with a json body)', async () => {
        const mock = getAPIv2Mock({ authorization }).get(`/${route}/some-slug`).reply(500, {
          title: 'bad request',
          detail: 'something went so so wrong',
          status: 500,
        });

        const result = await run([
          '__tests__/__fixtures__/changelog/slug-docs/new-doc-slug.md',
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
          .get(`/${route}/some-slug`)
          .reply(404)
          .post(`/${route}`, {
            type: 'added',
            title: 'This is the changelog title',
            content: { body: '\nBody\n' },
            slug: 'some-slug',
          })
          .reply(201, {});

        const result = await run(['__tests__/__fixtures__/changelog/slug-docs/new-doc-slug.md', '--key', key]);

        expect(result).toMatchSnapshot();
        expect(fs.writeFileSync).not.toHaveBeenCalled();

        mock.done();
      });

      it('should use that slug update an existing page in ReadMe', async () => {
        const mock = getAPIv2Mock({ authorization })
          .get(`/${route}/some-slug`)
          .reply(200)
          .patch(`/${route}/some-slug`, {
            type: 'added',
            title: 'This is the changelog title',
            content: { body: '\nBody\n' },
          })
          .reply(201, {});

        const result = await run(['__tests__/__fixtures__/changelog/slug-docs/new-doc-slug.md', '--key', key]);

        expect(result).toMatchSnapshot();
        expect(fs.writeFileSync).not.toHaveBeenCalled();

        mock.done();
      });
    });

    describe('given that the file has frontmatter issues', () => {
      it('should fix the frontmatter issues in the file and create the corrected file in ReadMe', async () => {
        const mock = getAPIv2Mock({ authorization })
          .get(`/${route}/autofixable`)
          .reply(404)
          .post(`/${route}`, {
            type: 'added',
            slug: 'autofixable',
            privacy: { view: 'anyone_with_link' },
            title: 'This is the changelog title',
            content: { body: '\nBody\n' },
          })
          .reply(201, {});

        prompts.inject([true]);

        const result = await run(['__tests__/__fixtures__/changelog/legacy-docs/autofixable.md', '--key', key]);

        expect(result).toMatchSnapshot();
        expect(fs.writeFileSync).toHaveBeenCalledWith(
          '__tests__/__fixtures__/changelog/legacy-docs/autofixable.md',
          expect.stringContaining('view: anyone_with_link'),
          { encoding: 'utf-8' },
        );

        mock.done();
      });

      it('should exit if the user declines to fix the issues', async () => {
        prompts.inject([false]);

        const result = await run(['__tests__/__fixtures__/changelog/legacy-docs/autofixable.md', '--key', key]);

        expect(result).toMatchSnapshot();
        expect(fs.writeFileSync).not.toHaveBeenCalled();
      });

      it('should skip client-side validation if the --skip-validation flag is passed', async () => {
        const mock = getAPIv2Mock({ authorization })
          .get(`/${route}/autofixable`)
          .reply(404)
          .post(`/${route}`, {
            type: 'added',
            slug: 'autofixable',
            hidden: true,
            title: 'This is the changelog title',
            content: { body: '\nBody\n' },
          })
          .reply(400, { title: 'bad request', detail: 'your hidden flag is whack' });

        const result = await run([
          '__tests__/__fixtures__/changelog/legacy-docs/autofixable.md',
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
          .get(`/${route}/unfixable`)
          .reply(404)
          .post(`/${route}`, {
            type: true,
            slug: 'unfixable',
            title: 'This is the changelog title',
            content: { body: '\nBody\n' },
          })
          .reply(201, {});

        const result = await run(['__tests__/__fixtures__/changelog/legacy-docs/unfixable.md', '--key', key]);

        expect(result).toMatchSnapshot();
        expect(fs.writeFileSync).not.toHaveBeenCalled();

        mock.done();
      });
    });

    describe('and the command is being run in a CI environment', () => {
      beforeEach(githubActionsEnv.before);

      afterEach(githubActionsEnv.after);

      it('should create a page in ReadMe and include `x-readme-source-url` source header', async () => {
        const getMock = getAPIv2MockForGHA({ authorization }).get(`/${route}/new-doc`).reply(404);

        const postMock = getAPIv2MockForGHA({
          authorization,
          'x-readme-source-url':
            'https://github.com/octocat/Hello-World/blob/ffac537e6cbbf934b08745a378932722df287a53/__tests__/__fixtures__/changelog/new-docs/new-doc.md',
        })
          .post(`/${route}`, {
            type: 'added',
            slug: 'new-doc',
            title: 'This is the changelog title',
            content: { body: '\nBody\n' },
          })
          .reply(201, {});

        const projectsMeMock = getAPIv2MockForGHA({ authorization }).get('/projects/me').reply(200, {
          data: {},
        });

        const result = await run(['__tests__/__fixtures__/changelog/new-docs/new-doc.md', '--key', key]);

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
        const result = await run(['__tests__/__fixtures__/changelog/legacy-docs/autofixable.md', '--key', key]);

        expect(result).toMatchSnapshot();
        expect(fs.writeFileSync).not.toHaveBeenCalled();
        projectsMeMock.done();
      });

      it('should bypass prompt if `--confirm-autofixes` flag is passed', async () => {
        const getMock = getAPIv2MockForGHA({ authorization }).get(`/${route}/autofixable`).reply(404);

        const postMock = getAPIv2MockForGHA({
          authorization,
          'x-readme-source-url':
            'https://github.com/octocat/Hello-World/blob/ffac537e6cbbf934b08745a378932722df287a53/__tests__/__fixtures__/changelog/legacy-docs/autofixable.md',
        })
          .post(`/${route}`, {
            type: 'added',
            slug: 'autofixable',
            title: 'This is the changelog title',
            content: { body: '\nBody\n' },
            privacy: { view: 'anyone_with_link' },
          })
          .reply(201, {});

        const projectsMeMock = getAPIv2MockForGHA({ authorization }).get('/projects/me').reply(200, {
          data: {},
        });

        const result = await run([
          '__tests__/__fixtures__/changelog/legacy-docs/autofixable.md',
          '--key',
          key,
          '--confirm-autofixes',
        ]);

        expect(result).toMatchSnapshot();
        expect(fs.writeFileSync).toHaveBeenCalledWith(
          '__tests__/__fixtures__/changelog/legacy-docs/autofixable.md',
          expect.stringContaining('view: anyone_with_link'),
          { encoding: 'utf-8' },
        );
        getMock.done();
        postMock.done();
        projectsMeMock.done();
      });
    });

    it('should error out if a non-404 error is returned from the GET request', async () => {
      const mock = getAPIv2Mock({ authorization }).get(`/${route}/new-doc`).reply(500);

      const result = await run(['__tests__/__fixtures__/changelog/new-docs/new-doc.md', '--key', key]);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).not.toHaveBeenCalled();

      mock.done();
    });

    it('should error out if a non-404 error is returned from the GET request (with a json body)', async () => {
      const mock = getAPIv2Mock({ authorization }).get(`/${route}/new-doc`).reply(500, {
        title: 'bad request',
        detail: 'something went so so wrong',
        status: 500,
      });

      const result = await run(['__tests__/__fixtures__/changelog/new-docs/new-doc.md', '--key', key]);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).not.toHaveBeenCalled();

      mock.done();
    });

    it('should not throw an error if `max-errors` flag is set to -1', async () => {
      const mock = getAPIv2Mock({ authorization }).get(`/${route}/new-doc`).reply(500, {
        title: 'bad request',
        detail: 'something went so so wrong',
        status: 500,
      });

      const result = await run([
        '__tests__/__fixtures__/changelog/new-docs/new-doc.md',
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
    it.skip('should create a page in ReadMe for each file in the directory and its subdirectories', async () => {
      const mock = getAPIv2Mock({ authorization })
        .get(`/${route}/simple-doc`)
        .reply(404)
        .post(`/${route}`, {
          slug: 'simple-doc',
          title: 'This is the changelog title',
          content: { body: '\nBody\n' },
        })
        .reply(201, {})
        .get(`/${route}/another-doc`)
        .reply(404)
        .post(`/${route}`, {
          slug: 'another-doc',
          title: 'This is another document title',
          content: { body: '\nAnother body\n' },
          type: 'added',
        })
        .reply(201, {});

      const result = await run([`__tests__/__fixtures__/${topic}/existing-docs`, '--key', key]);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).not.toHaveBeenCalled();

      mock.done();
    });

    it.skip('should update existing pages in ReadMe for each file in the directory and its subdirectories', async () => {
      const mock = getAPIv2Mock({ authorization })
        .get(`/${route}/simple-doc`)
        .reply(200)
        .patch(`/${route}/simple-doc`, {
          title: 'This is the changelog title',
          content: { body: '\nBody\n' },
        })
        .reply(201, {})
        .get(`/${route}/another-doc`)
        .reply(200)
        .patch(`/${route}/another-doc`, {
          title: 'This is another document title',
          type: 'added',
          content: { body: '\nAnother body\n' },
        })
        .reply(201, {});

      const result = await run([`__tests__/__fixtures__/${topic}/existing-docs`, '--key', key]);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).not.toHaveBeenCalled();

      mock.done();
    });

    it.skip('should handle complex frontmatter', async () => {
      const mock = getAPIv2Mock({ authorization })
        .get(`/${route}/basic`)
        .reply(200)
        .patch(`/${route}/basic`, {
          title: 'This is the changelog title',
          type: 'added',
          content: { body: 'frontmatter body', excerpt: 'frontmatter excerpt' },
        })
        .reply(201, {})
        .get(`/${route}/link`)
        .reply(200)
        .patch(`/${route}/link`, {
          title: 'This is the changelog title',
          type: 'added',
          content: {
            body: '\nBody\n',
            excerpt: 'frontmatter excerpt',
            link: { url: 'https://example.com', new_tab: true },
          },
        })
        .reply(201, {});

      const result = await run(['__tests__/__fixtures__/changelog/complex-frontmatter', '--key', key]);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).not.toHaveBeenCalled();

      mock.done();
    });

    describe('given that the directory contains parent/child docs', () => {
      it.skip('should upload parents before children', async () => {
        const mock = getAPIv2Mock({ authorization })
          .get(`/${route}/child`)
          .reply(404)
          .post(`/${route}`, {
            slug: 'child',
            title: 'Child',
            parent: { uri: `/${route}/parent` },
            content: { body: '\nBody\n' },
          })
          .reply(201, {})
          .get(`/${route}/friend`)
          .reply(404)
          .post(`/${route}`, {
            slug: 'friend',
            title: 'Friend',
            content: { body: '\nBody\n' },
          })
          .reply(201, {})
          .get(`/${route}/parent`)
          .reply(404)
          .post(`/${route}`, {
            slug: 'parent',
            title: 'Parent',
            parent: { uri: `/${route}/grandparent` },
            content: { body: '\nBody\n' },
          })
          .reply(201, {})
          .get(`/${route}/grandparent`)
          .reply(404)
          .post(`/${route}`, {
            slug: 'grandparent',
            title: 'Grandparent',
            content: { body: '\nBody\n' },
          })
          .reply(201, {});

        const result = await run(['__tests__/__fixtures__/changelog/multiple-docs', '--key', key]);

        expect(result).toMatchSnapshot();
        expect(fs.writeFileSync).not.toHaveBeenCalled();

        mock.done();
      });
    });

    it.skip('should error out if the directory does not contain any Markdown files', async () => {
      const result = await run(['__tests__/__fixtures__/ref-oas', '--key', key]);

      expect(result).toMatchSnapshot();
    });

    it.skip('should handle a mix of creates and updates and failures and skipped files', async () => {
      const mock = getAPIv2Mock({ authorization })
        .get(`/${route}/invalid-attributes`)
        .reply(404)
        .post(`/${route}`, {
          category: {
            uri: `/categories/${route}/some-category-uri`,
            'is-this-a-valid-property': 'nope',
          },
          slug: 'invalid-attributes',
          title: 'This is the changelog title',
          content: { body: '\nBody\n' },
        })
        .reply(201, {})
        .get(`/${route}/legacy-category`)
        .reply(200)
        .patch(`/${route}/legacy-category`, {
          type: 'added',
          title: 'This is the changelog title',
          content: { body: '\nBody\n' },
        })
        .reply(201, {})
        .get(`/${route}/some-slug`)
        .reply(404)
        .post(`/${route}`, {
          slug: 'some-slug',
          title: 'This is the changelog title',
          type: 'added',
          content: { body: '\nBody\n' },
        })
        .reply(500, {})
        .get(`/${route}/simple-doc`)
        .reply(404)
        .post(`/${route}`, {
          slug: 'simple-doc',
          title: 'This is the changelog title',
          content: { body: '\nBody\n' },
        })
        .reply(500, {});

      prompts.inject([true]);

      const result = await run(['__tests__/__fixtures__/changelog/mixed-docs', '--key', key]);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).toHaveBeenCalledTimes(5);

      mock.done();
    });

    it.skip('should handle a mix of creates and updates and failures and skipped files and not error out with `max-errors` flag', async () => {
      const mock = getAPIv2Mock({ authorization })
        .get(`/${route}/invalid-attributes`)
        .reply(404)
        .post(`/${route}`, {
          category: {
            uri: `/categories/${route}/some-category-uri`,
            'is-this-a-valid-property': 'nope',
          },
          slug: 'invalid-attributes',
          title: 'This is the changelog title',
          content: { body: '\nBody\n' },
        })
        .reply(201, {})
        .get(`/${route}/legacy-category`)
        .reply(200)
        .patch(`/${route}/legacy-category`, {
          type: 'added',
          title: 'This is the changelog title',
          content: { body: '\nBody\n' },
        })
        .reply(201, {})
        .get(`/${route}/some-slug`)
        .reply(404)
        .post(`/${route}`, {
          slug: 'some-slug',
          title: 'This is the changelog title',
          type: 'added',
          content: { body: '\nBody\n' },
        })
        .reply(500, {})
        .get(`/${route}/simple-doc`)
        .reply(404)
        .post(`/${route}`, {
          slug: 'simple-doc',
          title: 'This is the changelog title',
          content: { body: '\nBody\n' },
        })
        .reply(500, {});

      prompts.inject([true]);

      const result = await run(['__tests__/__fixtures__/changelog/mixed-docs', '--key', key, '--max-errors', '10']);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).toHaveBeenCalledTimes(5);

      mock.done();
    });

    it.skip('should handle a mix of creates and updates and failures and skipped files (dry run)', async () => {
      const mock = getAPIv2Mock({ authorization })
        .get(`/${route}/invalid-attributes`)
        .reply(404)
        .get(`/${route}/legacy-category`)
        .reply(200)
        .get(`/${route}/some-slug`)
        .reply(500)
        .get(`/${route}/simple-doc`)
        .reply(500);

      prompts.inject([true]);

      const result = await run(['__tests__/__fixtures__/changelog/mixed-docs', '--key', key, '--dry-run']);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).toHaveBeenCalledTimes(5);

      mock.done();
    });
  });

  describe('given that ReadMe project has bidirection sync set up', () => {
    it.skip('should error if validation is not skipped', async () => {
      nock.cleanAll();

      const mock = getAPIv2Mock({ authorization })
        .get('/projects/me')
        .reply(200, {
          data: { git: { connection: { status: 'active' } } },
        });

      const result = await run(['__tests__/__fixtures__/changelog/new-docs/new-doc.md', '--key', key]);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).not.toHaveBeenCalled();

      mock.done();
    });

    it.skip('should upload if validation is skipped', async () => {
      nock.cleanAll();

      const mock = getAPIv2Mock({ authorization })
        .get(`/${route}/new-doc`)
        .reply(404)
        .post(`/${route}`, {
          type: 'added',
          slug: 'new-doc',
          title: 'This is the changelog title',
          content: { body: '\nBody\n' },
        })
        .reply(201, {});

      const projectsMeMock = getAPIv2Mock({ authorization })
        .get('/projects/me')
        .reply(200, {
          data: { git: { connection: { status: 'active' } } },
        });

      const result = await run([
        '__tests__/__fixtures__/changelog/new-docs/new-doc.md',
        '--key',
        key,
        '--skip-validation',
      ]);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).not.toHaveBeenCalled();

      mock.done();
      projectsMeMock.done();
    });

    it.skip('should handle an error if /projects/me returns an error', async () => {
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

      const result = await run(['__tests__/__fixtures__/changelog/new-docs/new-doc.md', '--key', 'bad-api-key']);

      expect(result).toMatchSnapshot();
      expect(fs.writeFileSync).not.toHaveBeenCalled();

      mock.done();
    });
  });
});
