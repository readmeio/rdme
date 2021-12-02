const chalk = require('chalk');
const config = require('config');
const Table = require('table-layout');
const usage = require('command-line-usage');
const commands = require('./commands');

function tableizeCommands(cmds) {
  const content = cmds.map(command => {
    return {
      name: `${chalk.grey('$')} ${config.cli} ${command.name}`,
      description: command.description,
    };
  });

  return new Table(content, {
    columns: [
      { name: 'name', noWrap: true, width: 25, padding: { left: '  ', right: '' } },
      { name: 'description', maxWidth: 65 },
    ],
  }).renderLines();
}

const owlbert = () => {
  // http://asciiart.club
  return `                  📖 ${chalk.blue.bold(config.cli)}

    ${chalk.bold(`a utlity for interacting with ReadMe`)}
       .
       .\\\\                          /.
      ’  ‘                        ‘ ‘
      ( nn\\\\    .           .     /  )
      (nnnnn,.MM.          AM   .nn.
       .nnnndMM----_______--M.’’   /
       |nnn/nnnnnnnnnnnnnnnnn\\\\’mmm/
       /nnnn...nnnnnnnnnnn...mmmmm\\\\
      /nn        ‘qnnnP’       ‘mmm\\\\
      /n’   .XXX. \\\\nnn/   .XX.  \\\\mmb
      An   (XOXX)  nnn   (XOXX)  mm\\\\
     /nn   ‘XXXX’.~”~.   ‘XXX”’ .mmmb
     dnnn.      (    )n.       .mmmmb
    .nnnnnn....n.\\\\ ./nnnnnnnnnmmmmmm\\\\
  (READnnnnnnnnnnn’Y’nnnnnnnnnnmmmmmmME)
  REinnnnnnnnnnnnnnnnnnnnnnnnnmmmmmmmAD/
 /MEEnnnnnnnnnnnnnnnnnnnnnnnnnmmmmmmm)E'.
 READnnnnnnn*’             ‘*mmmmmmmm)MEE.
(READ|nnnn’    \\\\../  \\\\.../    ‘mmmmmM)EEE)
 READ(nn*’                      ‘mmm.MEEE)
  ‘READn’  \\\\._./  \\\\__./  \\\\.../     ‘MEE*’
       *                           /*`;
};

exports.commandUsage = cmd => {
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
      optionList: [...cmd.args].concat([
        {
          name: 'help',
          alias: 'h',
          type: Boolean,
          description: 'Display this usage guide',
        },
      ]),
      hide: cmd.hiddenArgs || [],
    },
  ];

  const similarCommands = commands.getSimilar(cmd.category, cmd.command);
  if (similarCommands.length) {
    helpContent.push({
      header: 'Related commands',
      content: tableizeCommands(similarCommands),
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
      header: 'Usage',
      content: `${config.cli} <command> [arguments]`,
    },
    {
      header: 'Options',
      optionList: args,
      hide: ['command'],
    },
  ];

  const categories = commands.listByCategory();

  Object.keys(categories).forEach(key => {
    const category = categories[key];

    helpContent.push({
      header: category.description,
      content: tableizeCommands(category.commands),
      raw: true,
    });
  });

  helpContent.push(
    {
      content: `Run ${chalk.dim(`${config.cli} help <command>`)} for help with a specific command.`,
      raw: true,
    },
    {
      content: `To get more help with ReadMe, checkout our docs at https://docs.readme.com.`,
      raw: true,
    }
  );

  return usage(helpContent);
};
