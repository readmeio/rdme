import { describe, it, expect } from 'vitest';

import { APIv1Error } from '../../src/lib/apiError.js';

const response = {
  error: 'VERSION_FORK_EMPTY',
  message: 'New versions need to be forked from an existing version.',
  suggestion: 'You need to pass an existing version (1.0, 1.0.1) in via the `for` parameter',
  docs: 'https://docs.readme.com/developers/logs/fake-metrics-uuid',
  help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
  poem: [
    'When creating a new version',
    'A `for` value must be attached',
    "You'll have to start from somewhere",
    "Since versions can't start from scratch",
  ],
};

describe('#APIv1Error', () => {
  it('should handle ReadMe API errors', () => {
    const error = new APIv1Error(response);

    expect(error.code).toBe(response.error);
    expect(error.message).toBe(
      'New versions need to be forked from an existing version.\n\nIf you need help, email support@readme.io and mention log "fake-metrics-uuid".',
    );
  });

  it('should handle API errors from a fetch `res` object', () => {
    const error = new APIv1Error({ error: response });

    expect(error.code).toBe(response.error);
  });

  it('should be able to handle generic non-API errors', () => {
    const msg = 'i am an generic javascript error';
    const error = new APIv1Error(msg);

    expect(error.code).toBe(msg);
    expect(error.message).toBe(msg);
  });
});
