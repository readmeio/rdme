import ciDetect from '@npmcli/ci-detect';
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
  /**
   * The CTRL+C handler discussed above.
   * @see {@link https://github.com/terkelg/prompts#optionsoncancel}
   */
  const onCancel = () => {
    process.stdout.write('\n');
    process.stdout.write('Thanks for using rdme! See you soon ✌️');
    process.stdout.write('\n\n');
    process.exit(1);
  };

  /**
   * Runs a check before every prompt renders to make sure that
   * prompt is not being run in a CI environment.
   */
  function onRender() {
    if (ciDetect() && process.env.NODE_ENV !== 'test') {
      process.stdout.write('\n');
      process.stdout.write(
        'Yikes! Looks like we were about to prompt you for something in a CI environment. Are you missing an argument?'
      );
      process.stdout.write('\n\n');
      process.stdout.write('Try running `rdme <command> --help` or get in touch at support@readme.io.');
      process.stdout.write('\n\n');
      process.exit(1);
    }
  }

  if (Array.isArray(questions)) {
    // eslint-disable-next-line no-param-reassign
    questions = questions.map(question => ({ onRender, ...question }));
  } else {
    // @ts-expect-error onRender is not a documented type,
    // but it definitely is a thing: https://github.com/terkelg/prompts#onrender
    // eslint-disable-next-line no-param-reassign
    questions.onRender = onRender;
  }

  return prompts(questions, { onCancel, ...options });
}
