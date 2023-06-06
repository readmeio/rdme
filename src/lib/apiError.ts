interface APIErrorResponse {
  docs?: string;
  error: string;
  help?: string;
  message: string;
  poem?: string[];
  suggestion?: string;
}

export default class APIError extends Error {
  code: string;

  constructor(res: string | APIErrorResponse | { error: APIErrorResponse }) {
    let err: string | APIErrorResponse;

    // Special handling to for fetch `res` arguments where `res.error` will contain our API error
    // response.
    if (typeof res === 'object') {
      if (typeof res?.error === 'object') {
        err = res.error;
      } else {
        err = res as APIErrorResponse;
      }
    } else {
      err = res;
    }

    super(err as unknown as string);

    this.name = 'APIError';

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

      this.name = 'APIError';
    } else {
      this.code = err;
      this.message = err;
    }
  }
}
