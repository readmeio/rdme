import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES modules don't have access to `__dirname` so we need to polyfill it.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function load(cmd) {
  let command = cmd;
  let subcommand = '';
  if (cmd.includes(':')) {
    [command, subcommand] = cmd.split(':');
    subcommand = `${subcommand}.js`;
  } else {
    command = `${command}.js`;
  }

  const file = path.join(__dirname, '../cmds', command, subcommand);
  try {
    const Command = await import(file).then(r => r.default);
    return new Command();
  } catch (e) {
    throw new Error('Command not found.');
  }
}

export async function list() {
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

  for (const file of files) {
    // eslint-disable-next-line no-await-in-loop
    const Command = await import(file).then(r => r.default);
    commands.push({
      file,
      command: new Command(),
    });
  }

  return commands;
}

export function getCategories() {
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

export async function listByCategory() {
  const categories = getCategories();
  const cmds = await list();
  cmds.forEach(c => {
    categories[c.command.cmdCategory].commands.push({
      name: c.command.command,
      description: c.command.description,
      position: c.command.position,
    });
  });

  return categories;
}

export async function getSimilar(cmdCategory, excludeCommand) {
  const categories = await listByCategory();
  return categories[cmdCategory].commands.filter(cmd => cmd.name !== excludeCommand);
}
