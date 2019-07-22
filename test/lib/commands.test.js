const assert = require('assert');
const commands = require('../../lib/commands').list();

describe('utils', () => {
  describe('getCommands', () => {
    it('should have commands returned', done => {
      assert.notEqual(commands.length, 0);
      done();
    });

    describe('commands', () => {
      it('should be configured properly', done => {
        commands.forEach(c => {
          const { file } = c;
          const cmd = c.command;

          assert.ok(
            typeof cmd.command === 'string' && cmd.command.length !== 0,
            `${file} does not have a command name`,
          );

          assert.ok(
            typeof cmd.usage === 'string' && cmd.usage.length !== 0,
            `${file} does not have a described usage`,
          );

          assert.ok(
            typeof cmd.description === 'string' && cmd.usage.description !== 0,
            `${file} does not have a description`,
          );

          assert.ok(
            typeof cmd.category === 'string' && cmd.usage.category !== 0,
            `${file} does not have a category`,
          );

          assert.ok(
            typeof cmd.weight === 'number' && cmd.usage.weight !== 0,
            `${file} does not have a weight`,
          );

          assert.ok(Array.isArray(cmd.args), `${file} does not have an args array defined`);
          assert.ok(typeof cmd.run === 'function', `${file} does not have a callable runner`);

          if (cmd.args.length > 0) {
            cmd.args.forEach(arg => {
              assert.ok(
                typeof arg.name === 'string' && arg.name.length !== 0,
                `${file} has an arg without a name`,
              );
              assert.ok(typeof arg.type !== 'undefined', `${file} has an arg without a type`);
            });
          }

          assert.ok(
            cmd.usage.indexOf(cmd.command) !== -1,
            `the configured usage in ${file} does not contain ${cmd.command}`,
          );
        });

        done();
      });

      it('should abide by our cli standards', done => {
        commands.forEach(c => {
          const { file } = c;
          const cmd = c.command;

          assert.equal(
            cmd.description[cmd.description.length - 1],
            '.',
            `the description for ${file} does not end in a period`,
          );

          cmd.args.forEach(arg => {
            if (arg.name === 'key') {
              assert.equal(
                arg.description,
                'Project API key',
                `the \`key\` arg in ${file} does not have our consistent description`,
              );
            } else if (arg.name === 'version') {
              assert.equal(
                arg.description,
                'Project version',
                `the \`version\` arg in ${file} does not have our consistent description`,
              );
            }
          });
        });

        done();
      });
    });
  });
});
