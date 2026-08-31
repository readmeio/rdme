import prompts from 'prompts';
import { afterEach, describe, expect, it, vi } from 'vitest';

import promptTerminal from '../../src/lib/promptWrapper.js';

vi.mock(import('prompts'), () => ({
  default: vi.fn(() => Promise.resolve({})),
}));

describe('#promptTerminal', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.mocked(prompts).mockClear();
    vi.restoreAllMocks();
  });

  it('attaches onRender to a single question and exits when a prompt would render in CI', async () => {
    vi.stubEnv('TEST_RDME_CI', 'true');
    const question = { type: 'text' as const, name: 'email', message: 'Email?' };
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('process.exit(1)');
    }) as never);
    const writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);

    await promptTerminal(question);

    const promptedQuestion = vi.mocked(prompts).mock.calls[0][0] as prompts.PromptObject;
    expect(promptedQuestion.onRender).toBeTypeOf('function');
    expect(() => promptedQuestion.onRender?.call({} as never)).toThrow('process.exit(1)');
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(writeSpy.mock.calls.flat().join('')).toContain('CI environment');
  });

  it('does not exit from onRender outside of CI', async () => {
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('process.exit(1)');
    }) as never);

    await promptTerminal({ type: 'text', name: 'email', message: 'Email?' });

    const promptedQuestion = vi.mocked(prompts).mock.calls[0][0] as prompts.PromptObject;
    promptedQuestion.onRender?.call({} as never);

    expect(exitSpy).not.toHaveBeenCalled();
  });

  it('attaches onRender to each question in an array', async () => {
    await promptTerminal([
      { type: 'text', name: 'email', message: 'Email?' },
      { type: 'invisible', name: 'password', message: 'Password?' },
    ]);

    const promptedQuestions = vi.mocked(prompts).mock.calls[0][0] as prompts.PromptObject[];
    expect(promptedQuestions).toHaveLength(2);
    expect(promptedQuestions.every(question => typeof question.onRender === 'function')).toBe(true);
  });

  it('exits from the default CTRL+C handler', async () => {
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('process.exit(1)');
    }) as never);
    const writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);

    await promptTerminal({ type: 'text', name: 'email', message: 'Email?' });

    const options = vi.mocked(prompts).mock.calls[0][1];
    expect(() => options?.onCancel?.({} as never, {})).toThrow('process.exit(1)');
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(writeSpy.mock.calls.flat().join('')).toContain('Thanks for using rdme');
  });
});
