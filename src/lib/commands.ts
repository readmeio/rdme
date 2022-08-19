import type { CommandCategories } from './baseCommand';

import commands from '../cmds';

export function getCategories(): Record<
  string,
  {
    description: string;
    commands: {
      name: string;
      description: string;
      position: number;
      hidden: boolean;
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
  return Object.entries(commands).map(([name, Cmd]) => {
    return {
      name,
      command: new Cmd(),
    };
  });
}

export function load(cmd: keyof typeof commands) {
  if (!(cmd in commands)) {
    throw new Error('Command not found.');
  }

  return new commands[cmd]();
}

export function listByCategory() {
  const categories = getCategories();
  const cmds = list();
  cmds.forEach(c => {
    categories[c.command.cmdCategory].commands.push({
      name: c.command.command,
      description: c.command.description,
      position: c.command.position,
      hidden: c.command.hidden,
    });
  });

  return categories;
}

export function getSimilar(cmdCategory: CommandCategories, excludeCommand: string) {
  const categories = listByCategory();
  return categories[cmdCategory].commands.filter(cmd => cmd.name !== excludeCommand && !cmd.hidden);
}
