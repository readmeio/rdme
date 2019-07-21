const config = require('config');
const usage = require('command-line-usage');
const util = require('./util');

const owlbert = () => {
  // http://asciiart.club
  return `          ░                                        ░
          ░░                                       ░░
        ░░░░░                                     ░░░░ ░
       ░░░░░░░                                    ░░░░░░
       ▐░░░░░░▄                                 ░░░░░░░░░
       ░░░░░░░░░▐░░░                        ░░░░░░░░░░░░░   ${config.cli.blue.bold}
        ░░░░░░░░░░░░░░░░░▐▐▐░░░░░░░░░░▐▐░░░░░░░░░░░░░░░░░░
      ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    ${
        `a utlity for interacting with ReadMe.io`.bold
      }
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

exports.commandUsage = cmd => {
  cmd.args.push({
    name: 'help',
    alias: 'h',
    type: Boolean,
    description: 'Display this usage guide',
  });

  const helpContent = [
    {
      content: cmd.description,
      raw: true,
    },
    {
      header: 'Usage',
      content: `${config.cli} ${cmd.usage}`,
    },
    {
      header: 'Options',
      optionList: cmd.args,
      hide: cmd.hiddenArgs || [],
    },
  ];

  return usage(helpContent);
};

exports.globalUsage = async args => {
  const helpContent = [
    {
      content: owlbert(),
      raw: true,
    },
    {
      content: `Usage: ${config.cli} <command> [arguments]`,
      raw: true,
    },
  ];

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

  const commands = util.getCommands();
  commands.forEach(c => {
    categories[c.command.category].commands.push({
      name: c.command.command,
      description: c.command.description || '',
      weight: c.command.weight,
    });
  });

  Object.keys(categories).forEach(key => {
    const category = categories[key];
    const commandCategory = {
      header: category.description,
      content: [],
    };

    if (!category.commands.length) return;

    category.commands
      .sort((a, b) => a.weight > b.weight)
      .forEach(command => {
        commandCategory.content.push({
          name: `${'$'.grey} ${config.cli} ${command.name}`,
          summary: command.description,
        });
      });

    helpContent.push(commandCategory);
  });

  helpContent.push({
    header: 'Options',
    optionList: args,
    hide: ['command'],
  });

  // @todo
  /* helpContent.push({
    content: `Run ${`${config.cli} help <command>`.dim} for help with a specific command.`,
    raw: true,
  }); */

  return usage(helpContent);
};
