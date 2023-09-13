import type { CommandCategories } from './baseCommand';

import commands from '../cmds';

function getCategories(): Record<
  string,
  {
    commands: {
      description: string;
      hidden: boolean;
      name: string;
    }[];
    description: string;
  }
> {
  return {
    apis: {
      description: 'OpenAPI / Swagger',
      commands: [],
    },
    docs: {
      description: 'Docs (a.k.a. Guides)',
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
    versions: {
      description: 'Versions',
      commands: [],
    },
    categories: {
      description: 'Categories',
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
      hidden: c.command.hidden,
    });
  });

  return categories;
}

export function getSimilar(cmdCategory: CommandCategories, excludeCommand: string) {
  const categories = listByCategory();
  return categories[cmdCategory].commands.filter(cmd => cmd.name !== excludeCommand && !cmd.hidden);
}
