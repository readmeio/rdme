import type Command from './baseCommand';
import type { CommandCategories } from './baseCommand';

import fs from 'fs';
import path from 'path';

export function getCategories(): Record<
  string,
  {
    description: string;
    commands: {
      name: string;
      description: string;
      position: number;
    }[];
  }
> {
  return {
    apis: {
      description: 'Upload OpenAPI/Swagger definitions',
      commands: [],
    },
    docs: {
      description: 'Documentation',
      commands: [],
    },
    changelogs: {
      description: 'Changelog',
      commands: [],
    },
    custompages: {
      description: 'Custom Pages',
      commands: [],
    },
    categories: {
      description: 'Categories',
      commands: [],
    },
    versions: {
      description: 'Versions',
      commands: [],
    },
    admin: {
      description: 'Administration',
      commands: [],
    },
    utilities: {
      description: 'Other useful commands',
      commands: [],
    },
  };
}

export function list() {
  const commands: { file: string; command: Command }[] = [];
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
    .filter(file => file.endsWith('.ts'))
    .map(file => path.join(cmdDir, file));

  files.forEach(file => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require, import/no-dynamic-require
    const { default: CommandClass } = require(file);

    commands.push({
      file,
      command: new CommandClass(),
    });
  });

  return commands;
}

export function load(cmd: string) {
  let command = cmd;
  let subcommand = '';
  if (cmd.includes(':')) {
    [command, subcommand] = cmd.split(':');
  }

  const file = path.join(__dirname, '../cmds', command, subcommand);
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require, import/no-dynamic-require
    const CommandClass = require(file);
    return new CommandClass();
  } catch (e) {
    throw new Error('Command not found.');
  }
}

export function listByCategory() {
  const categories = getCategories();
  const cmds = list();
  cmds.forEach(c => {
    categories[c.command.cmdCategory].commands.push({
      name: c.command.command,
      description: c.command.description,
      position: c.command.position,
    });
  });

  return categories;
}

export function getSimilar(cmdCategory: CommandCategories, excludeCommand: string) {
  const categories = listByCategory();
  return categories[cmdCategory].commands.filter(cmd => cmd.name !== excludeCommand);
}
