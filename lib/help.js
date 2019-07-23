const config = require('config');
const Table = require('table-layout');
const usage = require('command-line-usage');
const commands = require('./commands');

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

  const cmds = commands.list();
  cmds.forEach(c => {
    categories[c.command.category].commands.push({
      name: c.command.command,
      description: c.command.description,
      weight: c.command.weight,
    });
  });

  let availableCommands = [];
  Object.keys(categories).forEach(key => {
    const category = categories[key];
    const commandCategory = {
      header: category.description,
      content: [],
    };

    category.commands
      .sort((a, b) => a.weight > b.weight)
      .forEach(command => {
        commandCategory.content.push({
          command: `${'$'.grey} ${config.cli} ${command.name}`,
          description: command.description,
        });
      });

    availableCommands.push(`  ${commandCategory.header.bold}`);
    availableCommands = availableCommands.concat(
      new Table(commandCategory.content, {
        columns: [
          { name: 'command', noWrap: true, width: 28, padding: { left: '    ', right: '' } },
          { name: 'description', maxWidth: 65 },
        ],
      }).renderLines(),
    );

    availableCommands.push('');
  });

  // Pop off the last whitespace row in the availableCommands table so we don't have two line breaks
  // between it and the options list.
  delete availableCommands[availableCommands - 1];

  helpContent.push({
    header: 'Available commands',
    content: availableCommands,
    raw: true,
  });

  helpContent.push({
    header: 'Options',
    optionList: args,
    hide: ['command'],
  });

  helpContent.push({
    content: `Run ${`${config.cli} help <command>`.dim} for help with a specific command.`,
    raw: true,
  });

  return usage(helpContent);
};
