import { describe, expect, it } from 'vitest';

import { APIv1Error, APIv2Error } from '../../src/lib/apiError.js';

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

describe('#APIv2Error', () => {
  it('should include the title, detail, and field errors from the API', () => {
    const error = new APIv2Error({
      title: 'Validation failed',
      detail: 'The page could not be saved.',
      errors: [
        { key: 'slug', message: 'is required' },
        { key: 'title', message: 'must be a string' },
      ],
    });

    expect(error.name).toBe('APIv2Error');
    expect(error.response.title).toBe('Validation failed');
    expect(error.message).toContain('ReadMe API error: Validation failed');
    expect(error.message).toContain('The page could not be saved.');
    expect(error.message).toContain('slug: is required');
    expect(error.message).toContain('title: must be a string');
  });

  it('should use a generic message when the API response has no title', () => {
    const error = new APIv2Error({});

    expect(error.message).toBe(
      'The ReadMe API responded with an unexpected error. Please try again and if this issue persists, get in touch with us at support@readme.io.',
    );
  });
});
