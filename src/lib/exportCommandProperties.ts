import { Args, Flags } from '@oclif/core';

import { branchFlag, keyFlag } from './flags.js';

type Section = 'Changelog' | 'Custom Pages' | 'Guides' | 'Reference';
type Command = 'docs' | 'reference' | 'changelog' | 'custompages';

function pluralizeSection(section: Section): string {
  switch (section) {
    case 'Reference':
      return 'API References';
    case 'Custom Pages':
      return 'Custom Pages';
    case 'Guides':
      return 'Guides';
    case 'Changelog':
      return 'Changelogs';
    default:
      throw new TypeError(`Unknown section: ${section}`);
  }
}

export function summary(section: Section): string {
  const fileType = section === 'Custom Pages' ? 'Markdown or HTML' : 'Markdown';
  const sectionIdentifier = pluralizeSection(section);

  return `Export ${sectionIdentifier} from your ReadMe project to local ${fileType} files.`;
}

export function description(section: Section, command: Command): string {
  const sectionIdentifier = pluralizeSection(section);

  return `Downloads ${sectionIdentifier} from your ReadMe project API for the given branch and writes them to a directory to be later uploaded with \`<%= config.bin %> ${command} upload\`.`;
}

export function args(section: Section) {
  const fileType = section === 'Custom Pages' ? 'Markdown/HTML' : 'Markdown';

  return {
    folder: Args.string({
      description: `Directory to write exported ${fileType} into.`,
      required: true,
    }),
  };
}

export function examples(section: Section) {
  const directory = section === 'Custom Pages' ? 'custompages' : section.toLowerCase();
  const usesBranch = section !== 'Changelog';
  const docsOnly = section === 'Guides' || section === 'Reference';

  let sectionIdentifier = pluralizeSection(section);
  sectionIdentifier = sectionIdentifier === 'API References' ? 'API references' : section.toLowerCase();

  return [
    {
      description: `Export ${sectionIdentifier} from the stable branch into \`./${directory}\`:`,
      command: `<%= config.bin %> <%= command.id %> ./${directory}`,
    },
    usesBranch && {
      description: `Export ${sectionIdentifier} from a specific project version:`,
      command: `<%= config.bin %> <%= command.id %> ./${directory} --branch=1.0`,
    },
    docsOnly && {
      description: `Export a specific version, omitting empty ${section === 'Guides' ? 'guide' : 'reference'} pages:`,
      command: `<%= config.bin %> <%= command.id %> ./${directory} --branch=1.0 --docs-only`,
    },
  ].filter((ex): ex is { description: string; command: string } => ex !== undefined);
}

export function flags(section: Section) {
  return {
    key: keyFlag,
    ...branchFlag(),
    ...(section === 'Guides' || section === 'Reference'
      ? {
          'docs-only': Flags.boolean({
            default: false,
            description: 'Skip pages with an empty body unless the page type is `link`.',
          }),
        }
      : {}),
  };
}
