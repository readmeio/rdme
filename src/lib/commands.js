const fs = require('fs');
const path = require('path');

exports.load = cmd => {
  let command = cmd;
  let subcommand = '';
  if (cmd.includes(':')) {
    [command, subcommand] = cmd.split(':');
  }

  const file = path.join(__dirname, '../cmds', command, subcommand);
  try {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const Command = require(file);
    return new Command();
  } catch (e) {
    throw new Error('Command not found.');
  }
};

exports.listByCategory = () => {
  const categories = exports.getCategories();
  const cmds = exports.list();
  cmds.forEach(c => {
    categories[c.command.category].commands.push({
      name: c.command.command,
      description: c.command.description,
      position: c.command.position,
    });
  });

  return categories;
};

exports.getSimilar = (category, excludeCommand) => {
  const categories = exports.listByCategory();
  return categories[category].commands.filter(cmd => cmd.name !== excludeCommand);
};

exports.list = () => {
  const commands = [];
  const cmdDir = `${__dirname}/../cmds`;
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
    const Command = require(file);

    commands.push({
      file,
      command: new Command(),
    });
  });

  return commands;
};

exports.getCategories = () => {
  return {
    admin: {
      description: 'Administration',
      commands: [],
    },
    apis: {
      description: 'Upload OpenAPI/Swagger definitions',
      commands: [],
    },
    docs: {
      description: 'Documentation',
      commands: [],
    },
    versions: {
      description: 'Versions',
      commands: [],
    },
    utilities: {
      description: 'Other useful commands',
      commands: [],
    },
  };
};
