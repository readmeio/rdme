module.exports = class extends Error {
  constructor(res) {
    let err;

    // Special handling to for fetch `res` arguments where `res.error` will contain our API error response.
    if (typeof res === 'object') {
      if (typeof res?.error === 'object') {
        err = res.error;
      } else {
        err = res;
      }
    } else {
      err = res;
    }

    super(err);

    if (typeof err === 'object') {
      this.code = err.error;

      // If we returned help info in the API, show it otherwise don't render out multiple empty lines as we sometimes
      // throw `Error('non-api custom error message')` instances and catch them with this class.
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
};
