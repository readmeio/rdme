import fs from 'node:fs';
import path from 'node:path';

import chalk from 'chalk';
import frontMatter from 'gray-matter';
import { http } from 'msw';
import { setupServer } from 'msw/node';
import prompts from 'prompts';
import { describe, beforeAll, afterEach, it, expect, vi, beforeEach } from 'vitest';

import ChangelogsCommand from '../../../src/cmds/changelogs.js';
import APIError from '../../../src/lib/apiError.js';
import { getAPIPath, validateHeaders } from '../../helpers/get-api-mock.js';
import hashFileContents from '../../helpers/hash-file-contents.js';

const changelogs = new ChangelogsCommand();

const fixturesBaseDir = '__fixtures__/changelogs';
const fullFixturesDir = `${__dirname}./../../${fixturesBaseDir}`;
const key = 'API_KEY';

describe('rdme changelogs', () => {
  let simpleExistingDoc;
  let anotherExistingDoc;
  let newDoc;

  const server = setupServer(
    // existing docs
    http.get(getAPIPath('/api/v1/changelogs/simple-doc'), ({ request }) => {
      validateHeaders(request.headers, key);
      return Response.json({ slug: simpleExistingDoc.slug, lastUpdatedHash: 'anOldHash' });
    }),
    http.get(getAPIPath('/api/v1/changelogs/another-doc'), ({ request }) => {
      validateHeaders(request.headers, key);
      return Response.json({ slug: anotherExistingDoc.slug, lastUpdatedHash: 'anOldHash' });
    }),
    http.put(getAPIPath('/api/v1/changelogs/simple-doc'), ({ request }) => {
      validateHeaders(request.headers, key);
      // eslint-disable-next-line vitest/no-standalone-expect
      expect(request.json()).resolves.toStrictEqual({
        body: simpleExistingDoc.doc.content,
        lastUpdatedHash: simpleExistingDoc.hash,
        ...simpleExistingDoc.doc.data,
      });
      return Response.json({ slug: simpleExistingDoc.slug, body: simpleExistingDoc.doc.content });
    }),
    http.put(getAPIPath('/api/v1/changelogs/another-doc'), ({ request }) => {
      validateHeaders(request.headers, key);
      // eslint-disable-next-line vitest/no-standalone-expect
      expect(request.json()).resolves.toStrictEqual({
        body: anotherExistingDoc.doc.content,
        lastUpdatedHash: anotherExistingDoc.hash,
        ...anotherExistingDoc.doc.data,
      });
      return Response.json({ slug: anotherExistingDoc.slug, body: anotherExistingDoc.doc.content });
    }),
    // new doc
    http.get(getAPIPath('/api/v1/changelogs/new-doc'), ({ request }) => {
      validateHeaders(request.headers, key);
      return Response.json(
        {
          error: 'CHANGELOG_NOTFOUND',
          message: "The changelog with the slug 'new-doc' couldn't be found",
          suggestion: '...a suggestion to resolve the issue...',
          help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
        },
        { status: 404 },
      );
    }),
    http.post(getAPIPath('/api/v1/changelogs'), async ({ request }) => {
      validateHeaders(request.headers, key);
      const body = (await request.json()) as object;
      return Response.json({
        _id: '1234',
        ...body,
      });
    }),
    // new doc with slug specified in front matter
    http.get(getAPIPath('/api/v1/changelogs/marc-actually-wrote-a-test'), ({ request }) => {
      validateHeaders(request.headers, key);
      return Response.json(
        {
          error: 'CHANGELOG_NOTFOUND',
          message: "The changelog with the slug 'new-doc' couldn't be found",
          suggestion: '...a suggestion to resolve the issue...',
          help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
        },
        { status: 404 },
      );
    }),
  );

  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it('should prompt for login if no API key provided', async () => {
    const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    prompts.inject(['this-is-not-an-email', 'password', 'subdomain']);
    // @ts-expect-error deliberately passing in bad data
    await expect(changelogs.run({})).rejects.toStrictEqual(new Error('You must provide a valid email address.'));
    consoleInfoSpy.mockRestore();
  });

  it('should error in CI if no API key provided', async () => {
    process.env.TEST_RDME_CI = 'true';
    // @ts-expect-error deliberately passing in bad data
    await expect(changelogs.run({})).rejects.toStrictEqual(
      new Error('No project API key provided. Please use `--key`.'),
    );
    delete process.env.TEST_RDME_CI;
  });

  it('should error if no path provided', () => {
    return expect(changelogs.run({ key })).rejects.toStrictEqual(
      new Error('No path provided. Usage `rdme changelogs <path> [options]`.'),
    );
  });

  it('should error if the argument is not a folder', () => {
    return expect(changelogs.run({ key, filePath: 'not-a-folder' })).rejects.toStrictEqual(
      new Error("Oops! We couldn't locate a file or directory at the path you provided."),
    );
  });

  it('should error if the folder contains no markdown files', () => {
    return expect(changelogs.run({ key, filePath: '.github/workflows' })).rejects.toStrictEqual(
      new Error(
        "The directory you provided (.github/workflows) doesn't contain any of the following required files: .markdown, .md.",
      ),
    );
  });

  describe('existing changelogs', () => {
    beforeAll(() => {
      let fileContents = fs.readFileSync(path.join(fullFixturesDir, '/existing-docs/simple-doc.md'));
      simpleExistingDoc = {
        slug: 'simple-doc',
        doc: frontMatter(fileContents),
        hash: hashFileContents(fileContents),
      };

      fileContents = fs.readFileSync(path.join(fullFixturesDir, '/existing-docs/subdir/another-doc.md'));
      anotherExistingDoc = {
        slug: 'another-doc',
        doc: frontMatter(fileContents),
        hash: hashFileContents(fileContents),
      };
    });

    it('should fetch changelog and merge with what is returned', () => {
      expect.assertions(3);

      return expect(changelogs.run({ filePath: `./__tests__/${fixturesBaseDir}/existing-docs`, key })).resolves.toBe(
        [
          `✏️ successfully updated 'simple-doc' with contents from __tests__/${fixturesBaseDir}/existing-docs/simple-doc.md`,
          `✏️ successfully updated 'another-doc' with contents from __tests__/${fixturesBaseDir}/existing-docs/subdir/another-doc.md`,
        ].join('\n'),
      );
    });

    it('should return changelog update info for dry run', () => {
      expect.assertions(1);

      return expect(
        changelogs.run({ dryRun: true, filePath: `./__tests__/${fixturesBaseDir}/existing-docs`, key }),
      ).resolves.toBe(
        [
          `🎭 dry run! This will update 'simple-doc' with contents from __tests__/${fixturesBaseDir}/existing-docs/simple-doc.md with the following metadata: ${JSON.stringify(
            simpleExistingDoc.doc.data,
          )}`,
          `🎭 dry run! This will update 'another-doc' with contents from __tests__/${fixturesBaseDir}/existing-docs/subdir/another-doc.md with the following metadata: ${JSON.stringify(
            anotherExistingDoc.doc.data,
          )}`,
        ].join('\n'),
      );
    });

    describe('unchanged changelogs', () => {
      beforeEach(() => {
        server.use(
          http.get(getAPIPath('/api/v1/changelogs/simple-doc'), ({ request }) => {
            validateHeaders(request.headers, key);
            return Response.json({ slug: simpleExistingDoc.slug, lastUpdatedHash: simpleExistingDoc.hash });
          }),
          http.get(getAPIPath('/api/v1/changelogs/another-doc'), ({ request }) => {
            validateHeaders(request.headers, key);
            return Response.json({ slug: anotherExistingDoc.slug, lastUpdatedHash: anotherExistingDoc.hash });
          }),
        );
      });

      it('should not send requests for changelogs that have not changed', () => {
        expect.assertions(1);

        return expect(changelogs.run({ filePath: `./__tests__/${fixturesBaseDir}/existing-docs`, key })).resolves.toBe(
          [
            '`simple-doc` was not updated because there were no changes.',
            '`another-doc` was not updated because there were no changes.',
          ].join('\n'),
        );
      });

      it('should adjust "no changes" message if in dry run', () => {
        expect.assertions(1);

        return expect(
          changelogs.run({ dryRun: true, filePath: `./__tests__/${fixturesBaseDir}/existing-docs`, key }),
        ).resolves.toBe(
          [
            '🎭 dry run! `simple-doc` will not be updated because there were no changes.',
            '🎭 dry run! `another-doc` will not be updated because there were no changes.',
          ].join('\n'),
        );
      });
    });
  });

  describe('new changelogs', () => {
    beforeAll(() => {
      const fileContents = fs.readFileSync(path.join(fullFixturesDir, '/new-docs/new-doc.md'));
      newDoc = {
        slug: 'new-doc',
        doc: frontMatter(fileContents),
        hash: hashFileContents(fileContents),
      };
    });

    it('should create new changelog', () => {
      return expect(changelogs.run({ filePath: `./__tests__/${fixturesBaseDir}/new-docs`, key })).resolves.toBe(
        `🌱 successfully created 'new-doc' (ID: 1234) with contents from __tests__/${fixturesBaseDir}/new-docs/new-doc.md`,
      );
    });

    it('should return creation info for dry run', () => {
      return expect(
        changelogs.run({ dryRun: true, filePath: `./__tests__/${fixturesBaseDir}/new-docs`, key }),
      ).resolves.toBe(
        `🎭 dry run! This will create 'new-doc' with contents from __tests__/${fixturesBaseDir}/new-docs/new-doc.md with the following metadata: ${JSON.stringify(
          newDoc.doc.data,
        )}`,
      );
    });

    it('should fail if any changelogs are invalid', () => {
      const slug = 'new-doc';
      const fullDirectory = `__tests__/${fixturesBaseDir}/failure-docs`;

      const errorObject = {
        error: 'CHANGELOG_INVALID',
        message: "We couldn't save this changelog (Changelog title cannot be blank).",
        suggestion: 'Make sure all the data is correct, and the body is valid Markdown.',
        docs: 'fake-metrics-uuid',
        help: "If you need help, email support@readme.io and include the following link to your API log: 'fake-metrics-uuid'.",
      };

      server.use(
        http.post(getAPIPath('/api/v1/changelogs'), ({ request }) => {
          validateHeaders(request.headers, key);
          return Response.json(errorObject, { status: 400 });
        }),
      );

      const formattedErrorObject = {
        ...errorObject,
        message: `Error uploading ${chalk.underline(`${fullDirectory}/${slug}.md`)}:\n\n${errorObject.message}`,
      };

      return expect(changelogs.run({ filePath: `./${fullDirectory}`, key })).rejects.toStrictEqual(
        new APIError(formattedErrorObject),
      );
    });

    it('should use slug provided in frontmatter', () => {
      return expect(changelogs.run({ filePath: `./__tests__/${fixturesBaseDir}/slug-docs`, key })).resolves.toBe(
        `🌱 successfully created 'marc-actually-wrote-a-test' (ID: 1234) with contents from __tests__/${fixturesBaseDir}/slug-docs/new-doc-slug.md`,
      );
    });
  });
});
