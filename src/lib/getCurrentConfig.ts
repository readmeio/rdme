import type { Hook } from '@oclif/core';

import configstore from './configstore.js';

/**
 * Retrieves stored user data values from env variables or configstore,
 * with env variables taking precedent
 */
// biome-ignore lint/suspicious/noConfusingVoidType: This function can be invoked with `.call()`.
export default function getCurrentConfig(this: Hook.Context | void): {
  apiKey?: string;
  email?: string;
  project?: string;
} {
  let debug = (...args: unknown[]) => {};
  if (this?.debug && typeof this.debug === 'function') {
    debug = this.debug;
  }

  const apiKey = (() => {
    switch (true) {
      case !!process.env.RDME_API_KEY:
        debug('using RDME_API_KEY env var for api key');
        return process.env.RDME_API_KEY;
      case !!process.env.README_API_KEY:
        debug('using README_API_KEY env var for api key');
        return process.env.README_API_KEY;
      default:
        debug('falling back to configstore value for api key');
        return configstore.get('apiKey');
    }
  })();

  const email = (() => {
    switch (true) {
      case !!process.env.RDME_EMAIL:
        debug('using RDME_EMAIL env var for email');
        return process.env.RDME_EMAIL;
      default:
        debug('falling back to configstore value for email');
        return configstore.get('email');
    }
  })();

  const project = (() => {
    switch (true) {
      case !!process.env.RDME_PROJECT:
        debug('using RDME_PROJECT env var for project');
        return process.env.RDME_PROJECT;
      default:
        debug('falling back to configstore value for project');
        return configstore.get('project');
    }
  })();

  return { apiKey, email, project };
}
