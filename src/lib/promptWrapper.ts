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
  const onCancel = () => {
    process.stdout.write('\n');
    process.stdout.write('Thanks for using rdme! See you soon ✌️');
    process.stdout.write('\n\n');
    process.exit(1);
  };

  return prompts(questions, { onCancel, ...options });
}
