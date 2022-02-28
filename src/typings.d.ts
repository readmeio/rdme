// `oas-normalize` neither exports types or has an entry in the `@types/` namespace so we need this
// for it to be importable.
declare module 'oas-normalize';

interface Command {
  // Name of the command.
  command: string;

  // A usage summary for the `--help` screen. For example: "validate [file] [options]"
  usage: string;

  // A short description of what the command does.
  description: string;

  // The category that the command should be listed under in the `--help` screen.
  category: string;

  // The position of where the command should lie within its category.
  position: number;

  // Any command arguments that should be hidden from help screens.
  hiddenArgs?: string[];

  // Arguments to supply to the command.
  // https://www.npmjs.com/package/command-line-args
  args?: {
    name: string;
    alias?: string;
    type: typeof String | typeof Boolean;
    description?: string;
    defaultOption?: boolean;
  }[];

  run(opts?: Record<string, unknown>): Promise<string | Error | unknown>;
}
