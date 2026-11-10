// oxlint-disable import/first -- `vi.mock` is hoisted and has to sit next to the import it replaces.
import type { CommandClass } from '../../src/index.js';

import fs from 'node:fs';
import path from 'node:path';

import { captureOutput } from '@oclif/test';
import debugModule from 'debug';
import nock from 'nock';
import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * `ci-info` freezes `isCI` / `GITHUB_ACTIONS` at import. These tests set `NODE_ENV=production`,
 * which would make that frozen detection report a real Actions run and change headers and
 * `::set-output`. Follow only the test flags so local and CI runs match.
 */
vi.mock(import('../../src/lib/isCI.js'), async importOriginal => {
  const actual = await importOriginal();
  return {
    ...actual,
    default: () => !!process.env.TEST_RDME_CI,
    isGHA: () => !!process.env.TEST_RDME_GHA,
  };
});

import DocsExportCommand from '../../src/commands/docs/export.js';
import DocsUploadCommand from '../../src/commands/docs/upload.js';
import OpenAPIUploadCommand from '../../src/commands/openapi/upload.js';
import BaseCommand, { neutralizeWorkflowCommands } from '../../src/lib/baseCommand.js';
import { writeCommandResult } from '../../src/lib/workflowCommands.js';
import { getAPIv1Mock, getAPIv2MockForGHA } from '../helpers/get-api-mock.js';
import { setupOclifConfig } from '../helpers/oclif.js';

/** Runner metadata that would otherwise leak into request logs or divert `core.setOutput`. */
const runnerEnv = [
  'GITHUB_OUTPUT',
  'GITHUB_REPOSITORY',
  'GITHUB_RUN_ATTEMPT',
  'GITHUB_RUN_ID',
  'GITHUB_RUN_NUMBER',
  'GITHUB_SERVER_URL',
  'GITHUB_SHA',
] as const;

const key = 'rdme_123';
const authorization = `Bearer ${key}`;

const forgedError = '::error title=forged::injected';
const forgedWarning = '::warning::x';
const forgedNotice = '::notice::x';
const forgedApiError = '::error title=forged::from-api';

class LogCommand extends BaseCommand<typeof BaseCommand> {
  run() {
    return Promise.resolve();
  }
}

/**
 * `runCommand` keeps `NODE_ENV=rdme-test`, which skips this sanitizer so snapshots stay stable.
 * These tests opt into the Actions logging path via `TEST_RDME_GHA` instead.
 */
async function runInGitHubActions(Command: CommandClass, args: string[], prepare?: () => void) {
  vi.stubEnv('TEST_RDME_GHA', 'true');
  // A missing value deletes the var. The real runner's env would change request logs and `::set-output`.
  for (const name of runnerEnv) vi.stubEnv(name);
  const oclifConfig = await setupOclifConfig();

  try {
    return await captureOutput(
      async () => {
        prepare?.();
        await oclifConfig.runHook('prerun', { argv: args, Command });
        return Command.run(args, oclifConfig);
      },
      { testNodeEnv: 'production' },
    );
  } finally {
    vi.unstubAllEnvs();
  }
}

// oclif appends `platform-arch node-vX.Y.Z` to the user agent, and `Command.run` rebuilds it.
const userAgentSuffix = ` ${process.platform}-${process.arch === 'ia32' ? 'x86' : process.arch} node-${process.version}`;

function stableStdout(stdout: string) {
  return stdout.replaceAll(userAgentSuffix, '');
}

describe('GitHub Actions workflow commands', () => {
  afterEach(() => {
    nock.cleanAll();
    vi.unstubAllEnvs();
  });

  describe('neutralizeWorkflowCommands()', () => {
    it('breaks `::` commands at the start of a line and keeps the line breaks', () => {
      expect(neutralizeWorkflowCommands(`ok\n${forgedError}`)).toBe('ok\n:​:error title=forged::injected');
      expect(neutralizeWorkflowCommands(`ok\r\n${forgedWarning}`)).toBe('ok\n:​:warning::x');
      expect(neutralizeWorkflowCommands(`ok\r${forgedNotice}`)).toBe('ok\n:​:notice::x');
      expect(neutralizeWorkflowCommands(forgedError)).toBe(':​:error title=forged::injected');
      expect(neutralizeWorkflowCommands('keep\nnewlines')).toBe('keep\nnewlines');
      expect(neutralizeWorkflowCommands('')).toBe('');
    });

    it('breaks `::` commands behind whitespace the runner trims', () => {
      for (const prefix of [' ', '   ', '\t', ' ', '\u0085', '　', ' \u0085\t']) {
        const output = neutralizeWorkflowCommands(`ok\n${prefix}${forgedError}`);
        expect(output).toBe(`ok\n${prefix}:​:error title=forged::injected`);
      }
    });

    it('breaks legacy `##[` commands anywhere in a line', () => {
      const output = neutralizeWorkflowCommands('docs/##[error]forged.md and ##[warning]again');
      expect(output).toMatchInlineSnapshot(`"docs/#​#[error]forged.md and #​#[warning]again"`);
    });

    it('leaves `::` that is not at the start of a line alone', () => {
      expect(neutralizeWorkflowCommands('Foo::bar and a:b')).toBe('Foo::bar and a:b');
    });

    it('is idempotent', () => {
      const once = neutralizeWorkflowCommands(`  ${forgedError}\n##[error]x`);
      expect(neutralizeWorkflowCommands(once)).toBe(once);
    });
  });

  describe('BaseCommand#log', () => {
    it('does not let repo-derived text start a workflow command in GitHub Actions', async () => {
      vi.stubEnv('TEST_RDME_GHA', 'true');
      const config = await setupOclifConfig();
      const command = new LogCommand([], config);

      const output = await captureOutput(
        // oxlint-disable-next-line require-await
        async () => {
          command.log(`docs/page.md\n${forgedWarning}`);
          command.log('100%%%% done\n%s', forgedError);
          command.log('   - %s', `a/b\n${forgedNotice}`);
          command.log('   - file.md: %s', `Nope\n${forgedApiError}`);
        },
        { testNodeEnv: 'production' },
      );

      expect(output.stdout).toMatchSnapshot();
      // One `util.format` pass: `%%%%` becomes `%%`, and the second pass must not reduce it again.
      expect(output.stdout).toContain('100%% done');
      expect(output.error).toBeUndefined();
    });

    it('does not let repo-derived text forge a workflow command on the debug stderr writer', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('TEST_RDME_GHA', 'true');

      const previousColors = debugModule.inspectOpts?.colors;
      debugModule.inspectOpts = debugModule.inspectOpts ?? {};
      debugModule.inspectOpts.colors = false;

      const config = await setupOclifConfig();
      const command = new LogCommand([], config);
      const previousNamespaces = debugModule.disable();
      debugModule.enable('rdme*');
      const stdout: string[] = [];
      const stderr: string[] = [];
      const writeOut = process.stdout.write;
      const writeErr = process.stderr.write;
      process.stdout.write = (chunk => {
        stdout.push(String(chunk));
        return true;
      }) as typeof process.stdout.write;
      process.stderr.write = (chunk => {
        stderr.push(String(chunk));
        return true;
      }) as typeof process.stderr.write;

      try {
        command.debug('version in spec: %s', '1.0 ##[error]forged');
        command.debug('spec %s', `docs/##[error]forged.json\n${forgedError}`);
      } finally {
        process.stdout.write = writeOut;
        process.stderr.write = writeErr;
        if (debugModule.inspectOpts) debugModule.inspectOpts.colors = previousColors;
        debugModule.enable(previousNamespaces);
      }

      const err = stderr.join('');
      const out = stdout.join('');
      // `core.debug` is a real command. The runner parses `::debug::` before `##[`.
      expect(out.split('\n').some(line => line.startsWith('::debug::') && line.includes('##[error]forged'))).toBe(true);
      expect(out.split('\n').some(line => /^[\s\u0085]*::error\b/u.test(line))).toBe(false);
      expect(err).toContain('version in spec:');
      expect(err).not.toContain('##[');
      expect(err.split('\n').some(line => /^[\s\u0085]*::/u.test(line))).toBe(false);
    });

    it('leaves local stdout unchanged', async () => {
      const config = await setupOclifConfig();
      const command = new LogCommand([], config);

      const output = await captureOutput(
        // oxlint-disable-next-line require-await
        async () => {
          command.log(`ok\n${forgedError}`);
        },
        { testNodeEnv: 'production' },
      );

      expect(output.stdout.split(/\r?\n/).some(line => line.startsWith(forgedError))).toBe(true);
    });
  });

  describe('command result', () => {
    it('does not print a workflow command from a repository filename', async () => {
      vi.stubEnv('TEST_RDME_GHA', 'true');

      const output = await captureOutput(
        // oxlint-disable-next-line require-await
        async () => {
          writeCommandResult(`##[error]forged.json is a valid OpenAPI API definition!\n${forgedError}`);
        },
        { testNodeEnv: 'production' },
      );

      expect(output.stdout).toContain('is a valid OpenAPI API definition!');
      expect(output.stdout).not.toContain('##[');
      expect(output.stdout.split('\n').some(line => /^[\s\u0085]*::/u.test(line))).toBe(false);
      expect(output.error).toBeUndefined();
    });

    it('prints a command result unchanged outside GitHub Actions', async () => {
      const output = await captureOutput(
        // oxlint-disable-next-line require-await
        async () => {
          writeCommandResult(`ok\n${forgedError}`);
        },
        { testNodeEnv: 'production' },
      );

      expect(output.stdout.split(/\r?\n/).some(line => line.startsWith(forgedError))).toBe(true);
    });
  });

  describe('docs upload', () => {
    it('does not emit a workflow command from a frontmatter slug', async () => {
      const slugPath = '/branches/stable/guides/ok::error%20title=forged::injected';
      const scopes: nock.Scope[] = [];

      const output = await runInGitHubActions(
        DocsUploadCommand,
        ['test/__fixtures__/docs/gha-inject/page.md', '--key', key, '--dry-run'],
        () => {
          scopes.push(
            getAPIv1Mock().get('/api/v1/migration').basicAuth({ user: key }).reply(201, {
              categories: {},
              parentPages: {},
            }),
            getAPIv2MockForGHA({ authorization }).get(slugPath).reply(404),
          );
        },
      );

      expect(output.error).toBeUndefined();
      expect(stableStdout(output.stdout)).toMatchSnapshot();
      scopes.forEach(scope => scope.done());
    });

    it('does not emit a workflow command from an API error title', async () => {
      const scopes: nock.Scope[] = [];

      const output = await runInGitHubActions(
        DocsUploadCommand,
        ['test/__fixtures__/docs/new-docs/new-doc.md', '--key', key, '--dry-run', '--max-errors=-1'],
        () => {
          scopes.push(
            getAPIv1Mock().get('/api/v1/migration').basicAuth({ user: key }).reply(201, {
              categories: {},
              parentPages: {},
            }),
            getAPIv2MockForGHA({ authorization })
              .get('/branches/stable/guides/new-doc')
              .reply(400, { title: `Nope\n${forgedApiError}` }),
          );
        },
      );

      expect(output.error).toBeUndefined();
      expect(stableStdout(output.stdout)).toMatchSnapshot();
      scopes.forEach(scope => scope.done());
    });
  });

  describe('openapi upload', () => {
    it('does not emit a workflow command from info.version', async () => {
      const spec = JSON.parse(fs.readFileSync('test/__fixtures__/petstore-simple-weird-version.json', 'utf8')) as {
        info: { version: string };
      };
      spec.info.version = `1.0\n${forgedWarning}`;
      const specPath = path.join('test', '__fixtures__', 'gha-inject-petstore.json');
      fs.writeFileSync(specPath, JSON.stringify(spec));

      const scopes: nock.Scope[] = [];

      try {
        const output = await runInGitHubActions(
          OpenAPIUploadCommand,
          [specPath, '--key', key, '--branch', 'stable', '--slug', 'petstore.json', '--dry-run'],
          () => {
            scopes.push(
              getAPIv2MockForGHA({ authorization })
                .get('/projects/me')
                .reply(200, { data: { subdomain: 'owl' } })
                .get('/branches/stable/apis')
                .reply(200, { data: [] }),
            );
          },
        );

        expect(output.error).toBeUndefined();
        expect(stableStdout(output.stdout)).toMatchSnapshot();
        scopes.forEach(scope => scope.done());
      } finally {
        fs.rmSync(specPath, { force: true });
      }
    });
  });

  describe('docs export', () => {
    it('does not emit a workflow command from a page slug', async () => {
      const evilSlug = `a/b\n${forgedNotice}`;
      const dir = path.join('test', '__fixtures__', 'gha-export-out');
      const scopes: nock.Scope[] = [];

      try {
        const output = await runInGitHubActions(DocsExportCommand, [dir, '--key', key], () => {
          scopes.push(
            getAPIv2MockForGHA({ authorization })
              .get('/branches/stable/categories/guides')
              .reply(200, { data: [{ title: 'Main' }] })
              .get('/branches/stable/categories/guides/Main/pages')
              .reply(200, { data: [{ slug: evilSlug }] })
              .get(`/branches/stable/guides/${encodeURIComponent(evilSlug)}`)
              .reply(404),
          );
        });

        expect(output.error).toBeUndefined();
        // `exportDocs` resolves the folder, so the logged path is absolute.
        expect(stableStdout(output.stdout).replaceAll(path.resolve(dir), dir)).toMatchSnapshot();
        scopes.forEach(scope => scope.done());
      } finally {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    });
  });
});
