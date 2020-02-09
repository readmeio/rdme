const commands = require('../../lib/commands').list();

describe('utils', () => {
  describe('#getCommands', () => {
    it('should have commands returned', () => {
      expect(commands).not.toHaveLength(0);
    });

    describe('commands', () => {
      it('should be configured properly', () => {
        commands.forEach(c => {
          const cmd = c.command;

          expect(typeof cmd.command === 'string' && cmd.command.length !== 0).toBeTruthy();
          expect(typeof cmd.usage === 'string' && cmd.usage.length !== 0).toBeTruthy();
          expect(typeof cmd.description === 'string' && cmd.usage.description !== 0).toBeTruthy();
          expect(typeof cmd.category === 'string' && cmd.usage.category !== 0).toBeTruthy();
          expect(typeof cmd.position === 'number' && cmd.usage.position !== 0).toBeTruthy();
          expect(Array.isArray(cmd.args)).toBeTruthy();
          expect(typeof cmd.run === 'function').toBeTruthy();

          if (cmd.args.length > 0) {
            cmd.args.forEach(arg => {
              expect(typeof arg.name === 'string' && arg.name.length !== 0).toBeTruthy();
              expect(typeof arg.type !== 'undefined').toBeTruthy();
            });
          }

          expect(cmd.usage.indexOf(cmd.command) !== -1).toBeTruthy();
        });
      });

      it('should abide by our cli standards', () => {
        commands.forEach(c => {
          const cmd = c.command;

          expect(cmd.description[cmd.description.length - 1]).toBe('.');

          cmd.args.forEach(arg => {
            if (arg.name === 'key') {
              expect(arg.description).toBe('Project API key');
            } else if (arg.name === 'version') {
              // If `version` is a hidden argument on the command, it won't have a description so
              // we don't need to bother with this test case.
              if (Array.isArray(cmd.hiddenArgs) && cmd.hiddenArgs.indexOf('version') !== -1) {
                return;
              }

              expect(arg.description).toBe(
                cmd.command !== 'versions' ? 'Project version' : 'A specific project version to view'
              );
            }
          });
        });
      });
    });
  });
});
