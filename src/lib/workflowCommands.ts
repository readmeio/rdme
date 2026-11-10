// oxlint-disable no-console -- `bin/run.js` prints a command's return value through here.
import { formatWithOptions, type InspectOptions } from 'node:util';

import debugModule from 'debug';

import { isGHA, isTest } from './isCI.js';

// Not whitespace to .NET's `char.IsWhiteSpace` or JS `\s`, so the runner can't trim it away.
const ZWSP = '\u200B';

// rdme is Node, but the GitHub Actions runner is a .NET app that decides what in our output is a workflow
// command, so this follows its rules: https://github.com/actions/runner/blob/ecb5f298fad8b116679389f6df064c1a0229d148/src/Runner.Common/ActionCommand.cs#L51-L132
export function neutralizeWorkflowCommands(text: string): string {
  // .NET's `TrimStart()` strips U+0085 before checking for `::`, while JS `\s` doesn't match it.
  // The legacy `##[cmd` format is matched anywhere in a line, so it's broken everywhere.
  return text
    .split(/\r\n|\r|\n/)
    .map(line => line.replace(/^([\s\u0085]*)::/u, `$1:${ZWSP}:`).replaceAll('##[', `#${ZWSP}#[`))
    .join('\n');
}

let debugLogSanitized = false;

/**
 * Neutralizes workflow commands on the `debug` package's stderr writer.
 *
 * `DEBUG=*` prints repo-derived text such as an OpenAPI `info.version` straight to stderr.
 * The legacy `##[` form matches anywhere in that line, so the `rdme:` prefix does not stop it.
 * `core.debug` is left alone: it emits a real `::debug::` command, and the runner accepts that
 * before it looks for `##[`.
 */
export function installDebugSanitizer() {
  if (debugLogSanitized) return;
  debugLogSanitized = true;

  const original = debugModule.log.bind(debugModule);
  debugModule.log = (first: unknown, ...rest: unknown[]) => {
    if (!(isGHA() && !isTest())) return original(first, ...rest);

    const rendered = formatWithOptions((debugModule.inspectOpts ?? {}) as InspectOptions, first, ...rest);
    return process.stderr.write(`${neutralizeWorkflowCommands(rendered)}\n`);
  };
}

/**
 * Prints the string a command returned.
 *
 * `openapi validate` returns a repository path, and the CLI entry prints it. In GitHub Actions
 * that path is neutralized first. This is not used for `core` commands.
 */
export function writeCommandResult(message: string) {
  const output = isGHA() && !isTest() ? neutralizeWorkflowCommands(message) : message;
  console.log(output);
}

installDebugSanitizer();
