import type { MigrationStats } from '../../../src/lib/hooks/exported.js';
import type { PageMetadata } from '../../../src/lib/readPage.js';
import type { OclifOutput } from '../../helpers/oclif.js';
import type { Hook } from '@oclif/core';

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { Config } from '@oclif/core';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import Command from '../../../src/commands/docs/migrate.js';
import { runCommand } from '../../helpers/oclif.js';

const fixtureDocs = 'test/__fixtures__/docs/new-docs';

type HookResult = Hook.Result<unknown>;

function emptyHookResult(): HookResult {
  return { successes: [], failures: [] };
}

function installMigrateHooks(hooks: {
  fileScan?: (opts: unknown) => HookResult;
  validation?: (opts: { pages: PageMetadata[] }) => HookResult;
}) {
  const originalRunHook = Config.prototype.runHook;
  vi.spyOn(Config.prototype, 'runHook').mockImplementation(function runHookOverride(this: Config, event, opts) {
    if (event === 'pre_markdown_file_scan') {
      return hooks.fileScan ? hooks.fileScan(opts) : emptyHookResult();
    }
    if (event === 'pre_markdown_validation') {
      return hooks.validation ? hooks.validation(opts as { pages: PageMetadata[] }) : emptyHookResult();
    }
    return originalRunHook.call(this, event, opts);
  });
}

function successfulValidation(pages: PageMetadata[], pluginName = 'test-plugin'): HookResult {
  return {
    successes: [
      {
        hook: 'pre_markdown_validation',
        plugin: { name: pluginName } as Hook.Result<unknown>['successes'][number]['plugin'],
        result: {
          pages,
          stats: {
            pages: pages.map(page => ({
              inputPath: page.filePath,
              outputPath: page.filePath,
              slug: page.slug,
              title: String(page.data.title ?? page.slug),
              type: 'migrated' as const,
            })),
          },
        },
      },
    ],
    failures: [],
  };
}

describe('rdme docs migrate', () => {
  let run: (args?: string[]) => OclifOutput;
  const tempDirs: string[] = [];

  beforeAll(() => {
    run = runCommand(Command);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    while (tempDirs.length) {
      const dir = tempDirs.pop();
      if (dir && fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    }
  });

  it('should error out if no path is passed', async () => {
    const output = await run();
    expect(output).toMatchSnapshot();
  });

  it('should hide warning if `--hide-experimental-warning` flag is passed', async () => {
    const output = await run(['test/__fixtures__/docs/new-docs', '--hide-experimental-warning']);
    expect(output).toMatchSnapshot();
  });

  it('should error out if no plugins are installed', async () => {
    const output = await run(['test/__fixtures__/docs/new-docs']);
    expect(output).toMatchSnapshot();
  });

  it('should throw when a file-scan plugin fails', async () => {
    installMigrateHooks({
      fileScan: () => ({
        successes: [],
        failures: [
          {
            hook: 'pre_markdown_file_scan',
            plugin: { name: 'broken-scan' } as Hook.Result<unknown>['failures'][number]['plugin'],
            error: new Error('scan exploded'),
          },
        ],
      }),
    });

    const output = await run([fixtureDocs, '--hide-experimental-warning']);

    expect(output.error).toBeInstanceOf(Error);
    expect(output.error?.message).toBe('Error executing the `broken-scan` plugin: scan exploded');
  });

  it('should throw when a validation plugin fails', async () => {
    installMigrateHooks({
      validation: () => ({
        successes: [],
        failures: [
          {
            hook: 'pre_markdown_validation',
            plugin: { name: 'broken-validate' } as Hook.Result<unknown>['failures'][number]['plugin'],
            error: new Error('validate exploded'),
          },
        ],
      }),
    });

    const output = await run([fixtureDocs, '--hide-experimental-warning']);

    expect(output.error).toBeInstanceOf(Error);
    expect(output.error?.message).toBe('Error executing the `broken-validate` plugin: validate exploded');
  });

  it('should ignore hook results that are empty or not Error instances', async () => {
    const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rdme-migrate-out-'));
    tempDirs.push(outputDir);

    installMigrateHooks({
      fileScan: () => ({
        successes: [
          {
            hook: 'pre_markdown_file_scan',
            plugin: { name: 'noop-scan' } as Hook.Result<unknown>['successes'][number]['plugin'],
            result: null,
          },
        ],
        failures: [
          {
            hook: 'pre_markdown_file_scan',
            plugin: { name: 'non-error-scan' } as Hook.Result<unknown>['failures'][number]['plugin'],
            error: 'not-an-error' as unknown as Error,
          },
        ],
      }),
      validation: () => ({
        successes: [
          {
            hook: 'pre_markdown_validation',
            plugin: { name: 'empty-pages' } as Hook.Result<unknown>['successes'][number]['plugin'],
            result: { pages: [], stats: { pages: [] } },
          },
        ],
        failures: [
          {
            hook: 'pre_markdown_validation',
            plugin: { name: 'non-error-validate' } as Hook.Result<unknown>['failures'][number]['plugin'],
            error: 'not-an-error' as unknown as Error,
          },
        ],
      }),
    });

    const output = await run([fixtureDocs, '--hide-experimental-warning', '--out', outputDir]);

    expect(output.error).toBeUndefined();
    expect(output.stdout).not.toContain('Markdown files updated');
    expect(fs.existsSync(path.join(outputDir, fixtureDocs, 'new-doc.md'))).toBe(false);
  });

  it('should rewrite the scan path when a file-scan plugin returns a directory', async () => {
    const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rdme-migrate-out-'));
    tempDirs.push(outputDir);

    installMigrateHooks({
      fileScan: () => ({
        successes: [
          {
            hook: 'pre_markdown_file_scan',
            plugin: { name: 'redirect' } as Hook.Result<unknown>['successes'][number]['plugin'],
            result: fixtureDocs,
          },
        ],
        failures: [],
      }),
      validation: ({ pages }) => successfulValidation(pages, 'redirect'),
    });

    const output = await run(['test/__fixtures__/ref-oas', '--hide-experimental-warning', '--out', outputDir]);

    expect(output.error).toBeUndefined();
    expect(output.stdout).toContain('Markdown files updated via the `redirect` plugin');
    expect(fs.existsSync(path.join(outputDir, fixtureDocs, 'new-doc.md'))).toBe(true);
    expect((output.result as { stats: MigrationStats }).stats.results.redirect.pages).toHaveLength(1);
  });

  it('should write transformed pages and record plugin stats', async () => {
    const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rdme-migrate-out-'));
    tempDirs.push(outputDir);

    installMigrateHooks({
      validation: ({ pages }) =>
        successfulValidation(
          pages.map(page => ({
            ...page,
            data: { ...page.data, title: 'Migrated title' },
          })),
        ),
    });

    const output = await run([fixtureDocs, '--hide-experimental-warning', '--out', outputDir]);

    expect(output.error).toBeUndefined();
    expect(output.stdout).toContain('1 Markdown files updated via the `test-plugin` plugin');
    const written = fs.readFileSync(path.join(outputDir, fixtureDocs, 'new-doc.md'), 'utf8');
    expect(written).toContain('title: Migrated title');
    expect((output.result as { stats: MigrationStats }).stats.results['test-plugin'].pages[0]).toMatchObject({
      slug: 'new-doc',
      type: 'migrated',
    });
  });

  it('should skip frontmatter validation when `--skip-validation` is set', async () => {
    const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rdme-migrate-out-'));
    tempDirs.push(outputDir);

    installMigrateHooks({
      validation: ({ pages }) => successfulValidation(pages),
    });

    const output = await run([fixtureDocs, '--hide-experimental-warning', '--skip-validation', '--out', outputDir]);

    expect(output.error).toBeUndefined();
    expect(output.stderr).not.toContain('Validating frontmatter data');
    expect(fs.existsSync(path.join(outputDir, fixtureDocs, 'new-doc.md'))).toBe(true);
  });

  it('should record the unzipped directory when the input is a zip of guides', async () => {
    const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'rdme-migrate-zip-'));
    tempDirs.push(workspace);
    const outputDir = path.join(workspace, 'out');
    fs.mkdirSync(outputDir);

    const sourceDir = path.join(workspace, 'guides');
    fs.mkdirSync(sourceDir);
    fs.copyFileSync(path.join(fixtureDocs, 'new-doc.md'), path.join(sourceDir, 'new-doc.md'));
    const zipPath = path.join(workspace, 'guides.zip');
    execFileSync('zip', ['-r', zipPath, 'guides'], { cwd: workspace });

    installMigrateHooks({
      validation: ({ pages }) => successfulValidation(pages, 'zip-plugin'),
    });

    const output = await run([zipPath, '--hide-experimental-warning', '--skip-validation', '--out', outputDir]);

    expect(output.error).toBeUndefined();
    const stats = (output.result as { stats: MigrationStats }).stats;
    expect(stats.unzippedAssetsDir).toBeDefined();
    expect(stats.unzippedAssetsDir).toMatch(/guides$/);
  });
});
