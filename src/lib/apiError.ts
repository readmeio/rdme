/**
 * APIv1ErrorResponse is the shape of the error response we get from ReadMe API v1.
 */
export interface APIv1ErrorResponse {
  docs?: string;
  error: string;
  help?: string;
  message: string;
  poem?: string[];
  suggestion?: string;
}

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
