const path = require('path');
const fs = require('fs');
const config = require('config');
const usage = require('command-line-usage');

const owlbert = () => {
  // http://asciiart.club
  return `          ░                                        ░
          ░░                                       ░░
        ░░░░░                                     ░░░░ ░
       ░░░░░░░                                    ░░░░░░
       ▐░░░░░░▄                                 ░░░░░░░░░
       ░░░░░░░░░▐░░░                        ░░░░░░░░░░░░░   ${config.cli.blue.bold}
        ░░░░░░░░░░░░░░░░░▐▐▐░░░░░░░░░░▐▐░░░░░░░░░░░░░░░░░░
      ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    ${`a utlity for interacting with ReadMe.io`.bold}
      ▐░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
      ▐░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
      ▐░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▄▄▄▄░░░
      ▐░░░░░░░░░░░░░░░▄█▓▓▓▓▓▓█▄░░░░░░░░░░░░░░▄█▓▓▓▓▓▓▓▓▓▄░          ░░
      ▐░░░░░░░░░░░░▄▓▓▓▓▓▓▓▓▓▓▓▓▓▓▄░░░░░░░░░▄▓▓▓▓▓▓▓▓▓▓▓▓▓▓▄       ░░░░░░░░░
      ░░░░░░░░░░░░▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▌░░░░░░░▐▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▄      ░░░░░░░░░░
      ░░░░░░░░░░░▐▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▄░░░░░░▒▓▓▓▓█▀▓▓▓▓▓▓▓▓▓▓▓    ░░░░░░░░░░░░░░░░
      ░░░░░░░░░░░▒▓▓▓▓▀  ▓▓▓▓▓▓▓▓▓▓▓▌░░░░░░▐▓▓▓   ▀▀▓▓▓▓▓▓▓▓▌   ░░░░░░░░░░░░░░░░
      ▐░░░░░░░░░░▐▓▓▓▌     ▐▓▓▓▓▓▓▓▓░░░░░░░░▀▓▓▄   ▄▓▓▓▓▓▓▓▓   ░░░░░░░░░░░░░░░░
      ▐░░░░░░░░░░░▐▓▓▓▌▄ ▄▄▓▓▓▓▓▓▓▓▀░░░░░░░░░░▀▓▓▓▓▓▓▓▓▓▓█▀  ░░░░░░░░░░░░░░░░
      ▐░░░░░░░░░░░░░▀▓▓▓▓▓▓▓▓▓▓▓█▀░░░░░░░░░░░░░░░▀▀▀▀▀▀░░░  ░░░░░░░░░░░░░░░
      ▐░░░░░░░░░░░░░░░░▀▀▀▀▀▀▀░░░░░░░░░░▄▄▄░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
      ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▒▒▒▒▒▒▒░░░░░░░░░░░░░░░░░░░░░░░░░
     ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▀▒▒▒░░░░░░░░░░░░░░░░░░░░░░░░
    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▀░░░░░░░░░░░░░░░░░░░░░
   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░`;
};

exports.commandUsage = (cmd) => {
  console.log(cmd)

  cmd.args.push({
    name: 'help',
    alias: 'h',
    type: Boolean,
    description: 'Display this usage guide'
  });

  const helpContent = [
    {
      content: cmd.description,
      raw: true
    },
    {
      header: 'Usage',
      content: `${config.cli} ${cmd.usage}`
    },
    {
      header: 'Options',
      optionList: cmd.args,
      hide: cmd.hiddenArgs || []
    }
  ];

  return usage(helpContent);
};

exports.globalUsage = async (args) => {
  const helpContent = [
    {
      content: owlbert(),
      raw: true
    },
    {
      content: `Usage: ${config.cli} <command> [arguments]`,
      raw: true
    }
  ];

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

  const categories = {
    admin: {
      description: 'Administration',
      commands: [],
    },
    apis: {
      description: 'Sync Swagger/OpenAPI files',
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

  files.forEach(file => {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const f = require(file);

    // Uncategorized commands shouldn't be surfaced.
    if (!f.category) return;

    categories[f.category].commands.push({
      name: f.command,
      description: f.description || '',
      weight: f.weight,
    });
  });

  Object.keys(categories).forEach(key => {
    const category = categories[key];
    const commandCategory = {
      header: category.description,
      content: [],
    }

    if (!category.commands.length) return;

    category.commands
      .sort((a, b) => a.weight > b.weight)
      .forEach(command => {
        commandCategory.content.push({
          name: `${'$'.grey} ${config.cli} ${command.name}`,
          summary: command.description
        })
      });

      helpContent.push(commandCategory)
  });

  helpContent.push({
    header: 'Options',
    optionList: args,
    hide: ['command']
  });

  // @todo
  /* helpContent.push({
    content: `Run ${`${config.cli} help <command>`.dim} for help with a specific command.`,
    raw: true,
  }); */

  return usage(helpContent);
};
