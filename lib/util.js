const fs = require('fs');
const path = require('path');

exports.getCommands = () => {
  const commands = [];
  const cmdDir = `${__dirname}/../cmds`
  const files = fs
    .readdirSync(cmdDir)
    .map(file => {
      const stats = fs.statSync(path.join(cmdDir, file));
      if (stats.isDirectory()) {
        return fs.readdirSync(path.join(cmdDir, file)).map(f => path.join(file, f));
      }
      return [file];
    })
    .reduce((a, b) => a.concat(b), [])
    .filter(file => file.endsWith('.js'))
    .map(file => path.join(cmdDir, file));

  files.forEach(file => {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const command = require(file);

    // Uncategorized commands shouldn't be surfaced.
    // if (!command.category) return;

    commands.push({
      file,
      command
    });
  });

  return commands;
};
