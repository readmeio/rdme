import type Command from './baseCommand';
import type { Section } from 'command-line-usage';

import chalk from 'chalk';
import usage from 'command-line-usage';

import * as commands from './commands';
import config from './config';

function formatCommands(cmds: { description: string; hidden: boolean; name: string }[]) {
  return cmds
    .sort((a, b) => (a.name > b.name ? 1 : -1))
    .filter(command => !command.hidden)
    .map(command => {
      return {
        name: `${chalk.grey('$')} ${config.cli} ${command.name}`,
        summary: command.description,
      };
    });
}

const owlbert = () => {
  // http://asciiart.club
  return `                  📖 ${chalk.blue.bold(config.cli)}

    ${chalk.bold('a utility for interacting with ReadMe')}
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

/* : {
    content?: string;
    header?: string;
    optionList?: Command.args[];
    raw?: boolean;
  }[] */

function commandUsage(cmd: Command) {
  const helpContent: Section[] = [
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

  const similarCommands = commands.getSimilar(cmd.cmdCategory, cmd.command);
  if (similarCommands.length) {
    helpContent.push({
      header: 'Related commands',
      content: formatCommands(similarCommands),
    });
  }

  return usage(helpContent);
}

async function globalUsage(args: Command['args']) {
  const helpContent: Section[] = [
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

  Object.keys(categories).forEach((key: keyof typeof categories) => {
    const category = categories[key];

    helpContent.push({
      header: category.description,
      content: formatCommands(category.commands),
    });
  });

  helpContent.push(
    {
      content: `Run ${chalk.dim(`${config.cli} help <command>`)} for help with a specific command.`,
      raw: true,
    },
    {
      content: 'To get more help with ReadMe, check out our docs at https://docs.readme.com.',
      raw: true,
    },
  );

  return usage(helpContent);
}

export { commandUsage, globalUsage };
