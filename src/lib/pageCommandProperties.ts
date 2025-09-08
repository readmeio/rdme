import { Args, Flags } from '@oclif/core';

type Section = 'Changelog' | 'Custom Pages' | 'Guides' | 'Reference';

export function summary(section: Section): string {
  const fileType = section === 'Custom Pages' ? 'Markdown or HTML' : 'Markdown';
  return `Upload ${fileType} files to the ${section} section of your ReadMe project.`;
}

export function description(section: Section): string {
  const fileType = section === 'Custom Pages' ? 'Markdown/HTML' : 'Markdown';
  return [
    `The path can either be a directory or a single ${fileType} file.`,
    `The ${fileType} files will require YAML frontmatter with certain ReadMe documentation attributes. Check out our docs for more info on setting up your frontmatter: https://docs.readme.com/main/docs/rdme#markdown-file-setup`,
  ].join('\n\n');
}

export function args(section: Section) {
  const fileType = section === 'Custom Pages' ? 'Markdown/HTML' : 'Markdown';
  return {
    path: Args.string({
      description: `Path to a local ${fileType} file or folder of ${fileType} files.`,
      required: true,
    }),
  };
}

export function examples(section: Section) {
  const fileType = section === 'Custom Pages' ? 'Markdown/HTML' : 'Markdown';
  const usesBranch = section !== 'Changelog';
  const branchFlag = usesBranch ? ' --branch={project-branch}' : '';
  const allExamples = [
    {
      description: `The path input can be a directory. This will also upload any ${fileType} files that are located in subdirectories:`,
      command: `<%= config.bin %> <%= command.id %> documentation/${branchFlag}`,
    },
    {
      description: `The path input can also be individual ${fileType} files:`,
      command: `<%= config.bin %> <%= command.id %> documentation/about.md${branchFlag}`,
    },
    {
      description: 'You can omit the `--branch` flag to default to the `stable` branch of your project:',
      command: '<%= config.bin %> <%= command.id %> [path]',
    },
    {
      description:
        'This command also has a dry run mode, which can be useful for initial setup and debugging. You can read more about dry run mode in our docs: https://docs.readme.com/main/docs/rdme#dry-run-mode',
      command: '<%= config.bin %> <%= command.id %> [path] --dry-run',
    },
  ];

  if (!usesBranch) {
    // remove the third example since it uses the branch flag
    allExamples.splice(2, 1);
  }
  return allExamples;
}

export function baseFlags(section: Section) {
  const fileType = section === 'Custom Pages' ? 'Markdown/HTML' : 'Markdown';
  // biome-ignore lint/suspicious/noImplicitAnyLet: This has an implicit `any` but we're filling it with constants below.
  let items;

  // biome-ignore lint/nursery/noUnnecessaryConditions: we're using a switch for type narrowing. biome is clowning here.
  switch (section) {
    case 'Changelog':
      items = 'Changelog entries' as const;
      break;
    case 'Custom Pages':
      items = 'custom pages' as const;
      break;
    case 'Guides':
      items = 'guides' as const;
      break;
    case 'Reference':
      items = 'reference pages' as const;
      break;
    default:
      throw new Error(`Unknown section: ${section}`);
  }

  return {
    'confirm-autofixes': Flags.boolean({
      hidden: true,
      summary: `Bypasses the prompt and automatically fixes up any autofixable errors that are found in the ${fileType} files.`,
      description:
        'This is useful if you are using this command in a CI/CD pipeline and want to ensure that the command does not prompt for user input.',
    }),
    'dry-run': Flags.boolean({
      description: `Runs the command without creating nor updating any ${items} in ReadMe. Useful for debugging.`,
      aliases: ['dryRun'],
      deprecateAliases: true,
    }),
    'max-errors': Flags.integer({
      summary: 'Maximum number of page uploading errors before the command throws an error.',
      description: `By default, this command will respond with a 1 exit code if any number of the ${fileType} files fail to upload. This flag allows you to set a maximum number of errors before the command fails. For example, if you set this flag to \`5\`, the command will respond with an error if 5 or more errors are encountered. If you do not want the command to fail under any circumstances (this could be useful for plugins where you want to handle the error handling yourself), set this flag to \`-1\`.`,
      default: 0,
      hidden: true,
    }),
    'skip-validation': Flags.boolean({
      description: `Skips the pre-upload validation of the ${fileType} files. This flag can be a useful escape hatch but its usage is not recommended.`,
      hidden: true,
    }),
  };
}
