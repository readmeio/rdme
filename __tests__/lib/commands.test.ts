/// <reference types="jest-extended" />
/* eslint-disable jest/no-conditional-expect, jest/no-if */
import type Command from '../../src/lib/baseCommand';

import SingleDocCommand from '../../src/cmds/docs/single';
import { CommandCategories } from '../../src/lib/baseCommand';
import * as commands from '../../src/lib/commands';

describe('utils', () => {
  describe('#list', () => {
    it('should have commands returned', () => {
      expect(commands.list()).not.toHaveLength(0);
    });

    describe('commands', () => {
      it('should be configured properly', () => {
        commands.list().forEach(c => {
          const cmd = c.command;

          expect(cmd.command).not.toBeEmpty();
          expect(cmd.usage).not.toBeEmpty();
          expect(cmd.usage).toStartWith(cmd.command);
          expect(cmd.description).not.toBeEmpty();
          expect(cmd.cmdCategory).not.toBeEmpty();
          expect(cmd.position).toBeNumber();
          expect(cmd.args).toBeArray();
          expect(cmd.run).toBeFunction();

          if (cmd.args.length > 0) {
            cmd.args.forEach(arg => {
              expect(arg.name).not.toBeEmpty();
              expect(arg.type).not.toBeEmpty();
            });
          }
        });
      });

      describe('cli standards', () => {
        describe.each<[string, Command]>(commands.list().map(cmd => [cmd.command.command, cmd.command]))(
          '%s',
          (_, command) => {
            it('should have a description that ends with punctuation', () => {
              const description = command.description.replace('[inactive]', '').replace('[deprecated]', '').trim();
              expect(description).toEndWith('.');
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
                      : 'A specific project version to view.'
                  );
                }
              });
            });
          }
        );
      });
    });
  });

  describe('#load', () => {
    it('should load a valid command', () => {
      expect(commands.load('docs:single')).toBeInstanceOf(SingleDocCommand);
    });

    it('should throw an error on an invalid command', () => {
      expect(() => {
        // @ts-expect-error Testing a valid failure case.
        commands.load('buster');
      }).toThrow('Command not found');
    });
  });

  describe('#listByCategory', () => {
    it('should list commands by category', () => {
      expect(commands.listByCategory()).toMatchSnapshot();
    });
  });

  describe('#getSimilar', () => {
    it('should pull similar commands', () => {
      expect(commands.getSimilar(CommandCategories.ADMIN, 'login')).toStrictEqual([
        {
          name: 'logout',
          description: 'Logs the currently authenticated user out of ReadMe.',
          position: 2,
        },
        {
          name: 'whoami',
          description: 'Displays the current user and project authenticated with ReadMe.',
          position: 3,
        },
      ]);
    });
  });
});
