import fs from 'fs';
import path from 'path';

export function load(cmd: string) {
  let command = cmd;
  let subcommand = '';
  if (cmd.includes(':')) {
    [command, subcommand] = cmd.split(':');
  }

  const file = path.join(__dirname, '../cmds', command, subcommand);
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require, import/no-dynamic-require
    const Command = require(file);
    return new Command();
  } catch (e) {
    throw new Error('Command not found.');
  }
}

export function list() {
  const commands: { file: string; command: Command }[] = [];
  const cmdDir = `${__dirname}/../cmds`;
  const files: string[] = fs
    .readdirSync(cmdDir)
    .map((file: string) => {
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
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require, import/no-dynamic-require
    const Command = require(file);

    commands.push({
      file,
      command: new Command(),
    });
  });

  return commands;
}

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
}

export function listByCategory() {
  const categories = getCategories();
  const cmds = list();
  cmds.forEach(c => {
    categories[c.command.category].commands.push({
      name: c.command.command,
      description: c.command.description,
      position: c.command.position,
    });
  });

  return categories;
}

export function getSimilar(category: string, excludeCommand: string) {
  const categories = listByCategory();
  return categories[category].commands.filter(cmd => cmd.name !== excludeCommand);
}
