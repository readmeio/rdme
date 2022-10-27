import prompts from 'prompts';

import { version as pkgVersion } from '../package.json';
import cli from '../src';
import conf from '../src/lib/configstore';

import getAPIMock from './helpers/get-api-mock';
import { after, before } from './helpers/get-gha-setup';

describe('cli', () => {
  it('command not found', async () => {
    await expect(cli(['no-such-command'])).rejects.toThrow('Command not found');
  });

  describe('--version', () => {
    it('should return version from package.json', async () => {
      await expect(cli(['--version'])).resolves.toBe(pkgVersion);
    });

    it('should return version if the `-V` alias is supplied', async () => {
      await expect(cli(['-V'])).resolves.toBe(pkgVersion);
    });

    it('should return version from package.json for help command', async () => {
      await expect(cli(['help', '--version'])).resolves.toBe(pkgVersion);
    });

    // This is necessary because we use --version for other commands like `docs`
    it('should only return version if no command', async () => {
      await expect(cli(['no-such-command', '--version'])).rejects.toThrow(
        // This can be ignored as it's just going to be a command not found error
        'Command not found.'
      );
    });
  });

  describe('--help', () => {
    beforeEach(() => {
      // The `table-layout` dependency within `command-line-usage` has a quirk in the 1.x family where if it's being
      // run within a Jest environment it won't always use the same amount of columns for tables, resulting in cases
      // where Jest snapshots will randomly return back different results.
      //
      // This issue has been fixed in later versions of `table-layout` but `command-line-usage` is still targeting the
      // 1.x series.
      //
      // See https://github.com/75lb/table-layout/issues/9 for more information.
      process.stdout.columns = 100;
      process.stderr.columns = 100;
    });

    /* eslint-disable @typescript-eslint/ban-ts-comment */
    afterEach(() => {
      // @ts-ignore This is the only way we can disable columns within the `table-layout` library.
      process.stdout.columns = undefined;
      // @ts-ignore
      process.stderr.columns = undefined;
    });
    /* eslint-enable @typescript-eslint/ban-ts-comment */

    it('should print help', async () => {
      await expect(cli(['--help'])).resolves.toContain('a utility for interacting with ReadMe');
    });

    it('should print help for the `-H` alias', async () => {
      await expect(cli(['-H'])).resolves.toContain('a utility for interacting with ReadMe');
    });

    it('should print usage for a given command', async () => {
      await expect(cli(['openapi', '--help'])).resolves.toMatchSnapshot();
    });

    it('should print usage for a given command if supplied as `help <command>`', async () => {
      await expect(cli(['help', 'openapi'])).resolves.toMatchSnapshot();
    });

    it('should not surface args that are designated as hidden', async () => {
      await expect(cli(['openapi', '--help'])).resolves.toMatchSnapshot();
    });

    it('should show related commands for a subcommands help menu', async () => {
      await expect(cli(['versions', '--help'])).resolves.toMatchSnapshot();
    });
  });

  describe('subcommands', () => {
    it('should load subcommands from the folder', async () => {
      await expect(cli(['openapi:validate', 'package.json'])).rejects.not.toThrow('Command not found.');
    });
  });

  it('should not error with undefined cmd', async () => {
    await expect(cli([])).resolves.toContain('Upload OpenAPI/Swagger definitions');
  });

  it('should add stored apiKey to opts', async () => {
    expect.assertions(1);
    const key = '123456';
    const version = '1.0.0';
    conf.set('apiKey', key);

    const versionMock = getAPIMock().get(`/api/v1/version/${version}`).basicAuth({ user: key }).reply(200, { version });

    await expect(cli(['docs', `--version=${version}`])).rejects.toStrictEqual(
      new Error('No path provided. Usage `rdme docs <path> [options]`.')
    );

    conf.clear();
    versionMock.done();
  });

  it('should error with `rdme oas` arguments passed in', async () => {
    await expect(cli(['oas', 'endpoint'])).rejects.toThrow(/.*/);
  });

  describe('GHA onboarding via @supportsGHA decorator', () => {
    let consoleInfoSpy;
    const key = '123';
    const slug = 'new-doc';

    beforeEach(() => {
      before(() => true);
      consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    });

    afterEach(() => {
      after();
      consoleInfoSpy.mockRestore();
    });

    const getCommandOutput = () => {
      return [consoleInfoSpy.mock.calls.join('\n\n')].filter(Boolean).join('\n\n');
    };

    it.each([
      ['changelogs', 'changelogs', ''],
      ['custompages', 'custompages', ''],
    ])('should run GHA workflow for the %s command', async (cmd, type, file) => {
      expect.assertions(3);
      prompts.inject([false]);

      const getMock = getAPIMock().get(`/api/v1/${type}/${slug}`).basicAuth({ user: key }).reply(404, {});

      await expect(
        cli([cmd, '--dryRun', `--key=${key}`, `__tests__/__fixtures__/${type}/new-docs/${file}`])
      ).rejects.toStrictEqual(
        new Error(
          'GitHub Actions workflow creation cancelled. If you ever change your mind, you can run this command again with the `--github` flag.'
        )
      );

      const output = getCommandOutput();
      expect(output).toMatch(`dry run! This will create '${slug}'`);
      expect(output).toMatch("Looks like you're running this command in a GitHub Repository!");

      getMock.done();
    });
  });
});
