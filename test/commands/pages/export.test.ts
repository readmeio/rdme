import type { OclifOutput } from '../../helpers/oclif.js';

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import nock from 'nock';
import { afterEach, beforeEach, beforeAll, describe, expect, it, vi } from 'vitest';

import DocsExportCommand from '../../../src/commands/docs/export.js';
import ReferenceExportCommand from '../../../src/commands/reference/export.js';
import { getAPIv2Mock } from '../../helpers/get-api-mock.js';
import { runCommand } from '../../helpers/oclif.js';

const key = 'rdme_123';
const authorization = `Bearer ${key}`;

function tempExportDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'rdme-docs-export-test-'));
}

describe.each([
  ['docs', DocsExportCommand, 'guides'],
  ['reference', ReferenceExportCommand, 'reference'],
] as const)('rdme %s upload', (topic, Command, route) => {
  let run: (args?: string[]) => OclifOutput;

  beforeAll(() => {
    run = runCommand(Command);
  });

  beforeEach(() => {
    vi.spyOn(fs, 'copyFileSync');
    vi.spyOn(fs, 'writeFileSync');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    nock.cleanAll();
  });

  it('should error when folder arg is missing', async () => {
    const output = await run(['--key', key]);
    expect(output.error.message).toMatchInlineSnapshot(`
      "Missing 1 required arg:
      folder  Directory to write exported Markdown into.
      See more help with --help"
    `);
  });

  it('should download guides and restructure files', async () => {
    const tmpDir = tempExportDir();
    try {
      const mock = getAPIv2Mock({ authorization })
        .get(`/branches/stable/categories/${route}`)
        .reply(200, { data: [{ title: 'Main' }] })
        .get(`/branches/stable/categories/${route}/Main/pages`)
        .reply(200, { data: [{ slug: 'intro' }] })
        .get(`/branches/stable/${route}/intro`)
        .reply(200, {
          data: {
            slug: 'intro',
            title: 'Introduction',
            type: 'basic',
            content: { body: 'Hello world' },
            category: { uri: `https://api.readme.com/v2/branches/stable/categories/${route}/main` },
          },
        });

      await run([tmpDir, '--key', key]);

      expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join(tmpDir, '.temp_download', 'intro.md'),
        expect.stringContaining(`---
category:
  uri: main
position: 0
slug: intro
title: Introduction
---
Hello world`),
        { encoding: 'utf-8' },
      );

      expect(fs.copyFileSync).toHaveBeenCalledTimes(1);
      expect(fs.copyFileSync).toHaveBeenCalledWith(
        path.join(tmpDir, '.temp_download', 'intro.md'),
        path.join(tmpDir, 'main', 'intro.md'),
      );

      mock.done();
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('should use `index.md` for pages that have children', async () => {
    const tmpDir = tempExportDir();
    try {
      const mock = getAPIv2Mock({ authorization })
        .get(`/branches/stable/categories/${route}`)
        .reply(200, { data: [{ title: 'Docs' }] })
        .get(`/branches/stable/categories/${route}/Docs/pages`)
        .reply(200, { data: [{ slug: 'parent-doc' }, { slug: 'child-doc' }] })
        .get(`/branches/stable/${route}/parent-doc`)
        .reply(200, {
          data: {
            slug: 'parent-doc',
            title: 'Parent',
            type: 'basic',
            content: { body: 'Parent body' },
            category: { uri: `https://api.readme.com/v2/branches/stable/categories/${route}/docs` },
          },
        })
        .get(`/branches/stable/${route}/child-doc`)
        .reply(200, {
          data: {
            slug: 'child-doc',
            title: 'Child',
            type: 'basic',
            content: { body: 'Child body' },
            category: { uri: `https://api.readme.com/v2/branches/stable/categories/${route}/docs` },
            parent: { uri: `https://api.readme.com/v2/branches/stable/${route}/parent-doc` },
          },
        });

      await run([tmpDir, '--key', key]);

      expect(fs.writeFileSync).toHaveBeenCalledTimes(2);
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join(tmpDir, '.temp_download', 'parent-doc.md'),
        expect.stringContaining(`---
category:
  uri: docs
position: 0
slug: parent-doc
title: Parent
---
Parent body`),
        { encoding: 'utf-8' },
      );

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join(tmpDir, '.temp_download', 'child-doc.md'),
        expect.stringContaining(`---
category:
  uri: docs
parent:
  uri: parent-doc
position: 0
slug: child-doc
title: Child
---
Child body`),
        { encoding: 'utf-8' },
      );

      expect(fs.copyFileSync).toHaveBeenCalledTimes(2);
      expect(fs.copyFileSync).toHaveBeenCalledWith(
        path.join(tmpDir, '.temp_download', 'parent-doc.md'),
        path.join(tmpDir, 'docs', 'parent-doc', 'index.md'),
      );
      expect(fs.copyFileSync).toHaveBeenCalledWith(
        path.join(tmpDir, '.temp_download', 'child-doc.md'),
        path.join(tmpDir, 'docs', 'parent-doc', 'child-doc.md'),
      );

      mock.done();
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
