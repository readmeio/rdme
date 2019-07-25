const config = require('config');
const Table = require('table-layout');
const usage = require('command-line-usage');
const commands = require('./commands');

function styleCommand(command) {
  return `${'$'.grey} ${config.cli} ${command.name}`;
}

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
        `a utlity for interacting with ReadMe`.bold
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

  const similarCommands = commands.getSimilar(cmd.category, cmd.command);
  if (similarCommands.length) {
    const related = [];
    similarCommands.forEach(similar => {
      related.push({
        name: styleCommand(similar),
        summary: similar.description,
      });
    });

    helpContent.push({
      header: 'Related commands',
      content: related,
    });
  }

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

  const categories = commands.listByCategory();

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
          command: styleCommand(command),
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
  delete availableCommands[availableCommands.length - 1];

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
