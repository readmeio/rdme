/* eslint-disable vitest/no-conditional-expect */
import type Command from '../../src/lib/baseCommand.js';

import { describe, it, expect, expectTypeOf } from 'vitest';

import DocsCommand from '../../src/cmds/docs/index.js';
import { CommandCategories } from '../../src/lib/baseCommand.js';
import * as commands from '../../src/lib/commands.js';

/** @see {@link https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore#_isempty} */
const isEmpty = obj => [Object, Array].includes((obj || {}).constructor) && !Object.entries(obj || {}).length;

describe('utils', () => {
  describe('#list', () => {
    it('should have commands returned', () => {
      return expect(commands.list()).not.toHaveLength(0);
    });

    describe('commands', () => {
      it('should be configured properly', () => {
        commands.list().forEach(c => {
          const cmd = c.command;

          expect(cmd).not.toSatisfy(isEmpty);
          expect(cmd.usage).not.toSatisfy(isEmpty);
          expect(cmd.usage).toMatch(cmd.command);
          expect(cmd.description).not.toSatisfy(isEmpty);
          expect(cmd.cmdCategory).not.toSatisfy(isEmpty);
          expectTypeOf(cmd.args).toBeArray();
          expectTypeOf(cmd.run).toBeFunction();

          if (cmd.args.length > 0) {
            cmd.args.forEach(arg => {
              expect(arg.name).not.toSatisfy(isEmpty);
              expect(arg.type).not.toSatisfy(isEmpty);
            });
          }
        });
      });

      describe('cli standards', () => {
        describe.each<[string, Command]>(commands.list().map(cmd => [cmd.command.command, cmd.command as Command]))(
          '%s',
          (_, command) => {
            it('should have a description that ends with punctuation', () => {
              const description = command.description.replace('[inactive]', '').replace('[deprecated]', '').trim();
              return expect(description).toSatisfy((d: string) => d.endsWith('.'));
            });

            it('should have standardized argument constructs', () => {
              command.args.forEach(arg => {
                if (arg.name === 'key') {
                  expect(arg.description).toBe('Project API key');
                } else if (arg.name === 'version') {
                  // If `version` is a hidden argument on the command, it won't have a description
                  // so we don't need to bother with this test case.
                  if (Array.isArray(command.hiddenArgs) && command.hiddenArgs.indexOf('version') !== -1) {
                    return;
                  }

                  expect(arg.description).toBe(
                    command.command !== 'versions'
                      ? 'Project version. If running command in a CI environment and this option is not passed, the main project version will be used.'
                      : 'A specific project version to view.',
                  );
                }
              });
            });
          },
        );
      });
    });
  });

  describe('#load', () => {
    it('should load a valid command', () => {
      return expect(commands.load('docs')).toBeInstanceOf(DocsCommand);
    });

    it('should throw an error on an invalid command', () => {
      return expect(() => {
        // @ts-expect-error Testing a valid failure case.
        commands.load('buster');
      }).toThrow('Command not found');
    });
  });

  describe('#listByCategory', () => {
    it('should list commands by category', () => {
      return expect(commands.listByCategory()).toMatchSnapshot();
    });
  });

  describe('#getSimilar', () => {
    it('should pull similar commands', () => {
      return expect(commands.getSimilar(CommandCategories.ADMIN, 'login')).toStrictEqual([
        {
          name: 'logout',
          description: 'Logs the currently authenticated user out of ReadMe.',
          hidden: false,
        },
        {
          name: 'whoami',
          description: 'Displays the current user and project authenticated with ReadMe.',
          hidden: false,
        },
      ]);
    });
  });
});
