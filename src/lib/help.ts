import type { Config } from '@oclif/core';
import type { HelpOptions } from '@oclif/core/interfaces';

import { Help } from '@oclif/core';
import { colorize } from '@oclif/core/ux';
import chalk from 'chalk';

function owlbert(this: CustomHelpClass) {
  // http://asciiart.club
  return `                  📖 ${chalk.blue.bold(this.config.bin)}

    ${chalk.bold(this.config.pjson.description)}
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
}

// Oclif docs on customizing the help class: https://oclif.io/docs/help_classes/
export default class CustomHelpClass extends Help {
  constructor(config: Config, opts?: Partial<HelpOptions>) {
    super(config, { ...opts, flagSortOrder: 'none', hideAliasesFromRoot: true });
  }

  formatRoot() {
    return [
      '',
      owlbert.call(this),
      '',
      this.section('VERSION', this.config.userAgent),
      '',
      this.section(
        'USAGE',
        `${colorize(this.config?.theme?.dollarSign, '$')} ${colorize(
          this.config?.theme?.bin,
          this.config.bin,
        )} [COMMAND]`,
      ),
    ].join('\n');
  }
}
