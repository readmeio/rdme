import prompts from 'prompts';

/**
 * The `prompts` library doesn't always interpret CTRL+C and release the terminal back to the user
 * so we need handle this ourselves. This function is just a simple overload of the main `prompts`
 * import that we use.
 *
 * @see {@link https://github.com/terkelg/prompts/issues/252}
 */
export default async function promptTerminal<T extends string = string>(
  questions: prompts.PromptObject<T> | prompts.PromptObject<T>[],
  options?: prompts.Options
): Promise<prompts.Answers<T>> {
  const enableTerminalCursor = () => {
    process.stdout.write('\x1B[?25h');
  };

  const onState = (state: { aborted: boolean }) => {
    if (state.aborted) {
      // If we don't re-enable the terminal cursor before exiting the program, the cursor will
      // remain hidden.
      enableTerminalCursor();
      process.stdout.write('\n');
      process.exit(1);
    }
  };

  if (Array.isArray(questions)) {
    // eslint-disable-next-line no-param-reassign
    questions = questions.map(question => ({ ...question, onState }));
  } else {
    // eslint-disable-next-line no-param-reassign
    questions.onState = onState;
  }

  return prompts(questions, options);
}
