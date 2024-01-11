import { describe, it } from 'vitest';

describe('hooks', () => {
  describe('prerun', () => {
    describe('--key flag', () => {
      it.todo('should error if in CI and no key is provided');
      it.todo('should properly prompt for login if not in CI');
      it.todo('should properly pass key flag');
      it.todo('should properly pass env var (make this an it.each)');
      it.todo('should properly pass configstore key');
      it.todo('should properly log to console in the event that configstore key matches flag (maybe? maybe not?)');
    });
  });
});
