import { Args } from '@oclif/core';
import parseArgsStringToArgv from 'string-argv';

import BaseCommand from '../lib/baseCommand.js';

/**
 * We have a weird edge case with our Docker image version of `rdme` where GitHub Actions
 * will pass all of the `rdme` arguments as a single string with escaped quotes,
 * as opposed to the usual array of strings that we typically expect with `process.argv`.
 *
 * For example, say the user sends us `rdme openapi "petstore.json"`.
 * Instead of `process.argv` being this (i.e., when running the command via CLI):
 * ['openapi', 'petstore.json']
 *
 * The GitHub Actions runner will send this to the `rdme` Docker image:
 * ['openapi "petstore.json"']
 *
 * To distinguish these, we have a hidden `docker-gha` command which
 * consumes arguments that are coming from the GitHub Actions runner.
 * This command parses those arguments and then runs the respective command.
 */
export default class DockerGitHubCommand extends BaseCommand<typeof DockerGitHubCommand> {
  static description = 'Wrapper command for consuming `rdme` commands via Docker + GitHub Actions.';

  static args = {
    rawArgv: Args.string(),
  };

  static hidden = true;

  async run() {
    const { rawArgv } = this.args;
    if (!rawArgv) {
      throw new Error("Oops! Looks like you're missing a command.");
    }
    const processArgv = parseArgsStringToArgv(rawArgv);
    const [commandId, ...args] = processArgv;
    return this.config.runCommand<string>(commandId, args);
  }
}
