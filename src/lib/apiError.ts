/**
 * APIv1ErrorResponse is the shape of the error response we get from ReadMe API v1.
 */

import chalk from 'chalk';

interface APIv1ErrorResponse {
  docs?: string;
  error: string;
  help?: string;
  message: string;
  poem?: string[];
  suggestion?: string;
}

/**
 * APIv2ErrorResponse is the shape of the error response we get from ReadMe API v2.
 */
export type APIv2ErrorResponse = Partial<{
  detail: string;
  errors?: {
    key: string;
    message: string;
  }[];
  poem: string[];
  status: number;
  title: string;
  type: string;
}>;

/**
 * Error class for handling ReadMe API v1 errors.
 *
 * @deprecated Use {@link APIv2Error} instead.
 */
export class APIv1Error extends Error {
  code: string;

  constructor(res: APIv1ErrorResponse | string | { error: APIv1ErrorResponse }) {
    let err: APIv1ErrorResponse | string;

    // Special handling to for fetch `res` arguments where `res.error` will contain our API error
    // response.
    if (typeof res === 'object') {
      if (typeof res?.error === 'object') {
        err = res.error;
      } else {
        err = res as APIv1ErrorResponse;
      }
    } else {
      err = res;
    }

    super(err as unknown as string);

    this.name = 'APIv1Error';

    if (typeof err === 'object') {
      this.code = err.error;

      // If we returned help info in the API, show it otherwise don't render out multiple empty
      // lines as we sometimes throw `Error('non-api custom error message')` instances and catch
      // them with this class.
      if (err?.help) {
        this.message = [err.message, '', err.help].join('\n');
      } else {
        this.message = err.message;
      }

      this.name = 'APIv1Error';
    } else {
      this.code = err;
      this.message = err;
    }
  }
}

/**
 * Error class for handling ReadMe API v2 errors.
 */
export class APIv2Error extends Error {
  response: APIv2ErrorResponse;

  constructor(res: APIv2ErrorResponse) {
    let stringified =
      'The ReadMe API responded with an unexpected error. Please try again and if this issue persists, get in touch with us at support@readme.io.';

    if (res.title) {
      stringified = `ReadMe API error: ${chalk.bold(res.title)}`;
    }

    if (res.detail) {
      stringified += `\n\n${res.detail}`;
    }

    if (res.errors?.length) {
      stringified += `\n\n${res.errors.map((e, i) => `${i + 1}. ${chalk.underline(e.key)}: ${e.message}`).join('\n')}`;
    }

    super(stringified);

    this.name = 'APIv2Error';

    this.response = res;
  }
}
