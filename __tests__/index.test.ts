import prompts from 'prompts';

import { version as pkgVersion } from '../package.json';
import cli from '../src';
import conf from '../src/lib/configstore';

import getAPIMock from './helpers/get-api-mock';
import { after, before } from './helpers/get-gha-setup';

describe('cli', () => {
  it('command not found', () => {
    return expect(cli(['no-such-command'])).rejects.toStrictEqual(
      new Error('Command not found.\n\nType `rdme help` to see all commands')
    );
  });

  describe('--version', () => {
    it('should return version from package.json', () => {
      return expect(cli(['--version'])).resolves.toBe(pkgVersion);
    });

    it('should return version if the `-V` alias is supplied', () => {
      return expect(cli(['-V'])).resolves.toBe(pkgVersion);
    });

    it('should return version from package.json for help command', () => {
      return expect(cli(['help', '--version'])).resolves.toBe(pkgVersion);
    });

    // This is necessary because we use --version for other commands like `docs`
    it('should error if command does not exist', () => {
      return expect(cli(['no-such-command', '--version'])).rejects.toStrictEqual(
        // This can be ignored as it's just going to be a command not found error
        new Error('Command not found.\n\nType `rdme help` to see all commands')
      );
    });
  });

  describe('args parsing in GitHub Actions runners', () => {
    it('should return version from package.json for help command (standard argv)', () => {
      return expect(cli(['help', '--version'])).resolves.toBe(pkgVersion);
    });

    it('should return version from package.json for help command (single string argv)', () => {
      return expect(cli(['docker-gha', 'help --version'])).resolves.toBe(pkgVersion);
    });

    it('should validate file (standard argv)', () => {
      return expect(
        cli(['openapi:validate', '__tests__/__fixtures__/petstore-simple-weird-version.json'])
      ).resolves.toBe('__tests__/__fixtures__/petstore-simple-weird-version.json is a valid OpenAPI API definition!');
    });

    it('should validate file (single string with file path in quotes)', () => {
      return expect(
        cli(['docker-gha', 'openapi:validate "__tests__/__fixtures__/petstore-simple-weird-version.json"'])
      ).resolves.toBe('__tests__/__fixtures__/petstore-simple-weird-version.json is a valid OpenAPI API definition!');
    });

    it('should attempt to validate file (single string with file path with spaces)', () => {
      return expect(cli(['docker-gha', 'openapi:validate "a non-existent directory/petstore.json"'])).rejects.toThrow(
        "ENOENT: no such file or directory, open 'a non-existent directory/petstore.json"
      );
    });
  });

  describe('--help', () => {
    it('should print help', () => {
      return expect(cli(['--help'])).resolves.toContain('a utility for interacting with ReadMe');
    });

    it('should print help for the `-H` alias', () => {
      return expect(cli(['-H'])).resolves.toContain('a utility for interacting with ReadMe');
    });

    it('should print usage for a given command', () => {
      return expect(cli(['openapi', '--help'])).resolves.toMatchSnapshot();
    });

    it('should print usage for a given command if supplied as `help <command>`', () => {
      return expect(cli(['help', 'openapi'])).resolves.toMatchSnapshot();
    });

    it('should not surface args that are designated as hidden', () => {
      return expect(cli(['openapi', '--help'])).resolves.toMatchSnapshot();
    });

    it('should show related commands for a subcommands help menu', () => {
      return expect(cli(['versions', '--help'])).resolves.toMatchSnapshot();
    });
  });

  describe('subcommands', () => {
    it('should load subcommands from the folder', () => {
      return expect(
        cli(['openapi:validate', '__tests__/__fixtures__/petstore-simple-weird-version.json'])
      ).resolves.toBe('__tests__/__fixtures__/petstore-simple-weird-version.json is a valid OpenAPI API definition!');
    });
  });

  it('should not error with undefined cmd', () => {
    return expect(cli([])).resolves.toContain('a utility for interacting with ReadMe');
  });

  describe('stored API key', () => {
    describe('stored API key via configstore', () => {
      let consoleInfoSpy;
      const key = '123456';
      const getCommandOutput = () => {
        return [consoleInfoSpy.mock.calls.join('\n\n')].filter(Boolean).join('\n\n');
      };

      beforeEach(() => {
        conf.set('email', 'owlbert-store@readme.io');
        conf.set('project', 'project-owlbert-store');
        conf.set('apiKey', key);
        consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
      });

      afterEach(() => {
        consoleInfoSpy.mockRestore();
        conf.clear();
      });

      it('should add stored apiKey to opts', async () => {
        expect.assertions(1);
        const version = '1.0.0';

        const versionMock = getAPIMock()
          .get(`/api/v1/version/${version}`)
          .basicAuth({ user: key })
          .reply(200, { version });

        await expect(cli(['docs', `--version=${version}`])).rejects.toStrictEqual(
          new Error('No path provided. Usage `rdme docs <path> [options]`.')
        );

        conf.clear();
        versionMock.done();
      });

      it('should inform a logged in user which project is being updated', async () => {
        await expect(cli(['openapi', '--create', '--update'])).rejects.toStrictEqual(
          new Error('The `--create` and `--update` options cannot be used simultaneously. Please use one or the other!')
        );

        expect(getCommandOutput()).toMatch(
          'owlbert-store@readme.io is currently logged in, using the stored API key for this project: project-owlbert-store'
        );
      });

      it('should not inform a logged in user when they pass their own key', async () => {
        await expect(cli(['openapi', '--create', '--update', '--key=asdf'])).rejects.toStrictEqual(
          new Error('The `--create` and `--update` options cannot be used simultaneously. Please use one or the other!')
        );

        expect(getCommandOutput()).toBe('');
      });
    });

    describe('stored API key via env vars', () => {
      let consoleInfoSpy;
      const key = '123456-env';
      const getCommandOutput = () => {
        return [consoleInfoSpy.mock.calls.join('\n\n')].filter(Boolean).join('\n\n');
      };

      beforeEach(() => {
        process.env.RDME_API_KEY = key;
        process.env.RDME_EMAIL = 'owlbert-env@readme.io';
        process.env.RDME_PROJECT = 'project-owlbert-env';
        consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
      });

      afterEach(() => {
        consoleInfoSpy.mockRestore();
        delete process.env.RDME_API_KEY;
        delete process.env.RDME_EMAIL;
        delete process.env.RDME_PROJECT;
      });

      it('should add stored apiKey to opts', async () => {
        expect.assertions(1);
        const version = '1.0.0';

        const versionMock = getAPIMock()
          .get(`/api/v1/version/${version}`)
          .basicAuth({ user: key })
          .reply(200, { version });

        await expect(cli(['docs', `--version=${version}`])).rejects.toStrictEqual(
          new Error('No path provided. Usage `rdme docs <path> [options]`.')
        );

        conf.clear();
        versionMock.done();
      });

      it('should not inform a logged in user which project is being updated', async () => {
        await expect(cli(['openapi', '--create', '--update'])).rejects.toStrictEqual(
          new Error('The `--create` and `--update` options cannot be used simultaneously. Please use one or the other!')
        );

        expect(getCommandOutput()).toBe('');
      });

      it('should not inform a logged in user when they pass their own key', async () => {
        await expect(cli(['openapi', '--create', '--update', '--key=asdf'])).rejects.toStrictEqual(
          new Error('The `--create` and `--update` options cannot be used simultaneously. Please use one or the other!')
        );

        expect(getCommandOutput()).toBe('');
      });
    });
  });

  it('should error with `rdme oas` arguments passed in', () => {
    return expect(cli(['oas', 'endpoint'])).rejects.toStrictEqual(
      new Error(
        "This `oas` integration is now inactive.\n\nIf you're looking to create an OpenAPI definition, we recommend https://npm.im/swagger-inline"
      )
    );
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
