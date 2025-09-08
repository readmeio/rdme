import type { Hook } from '@oclif/core';

import configstore from './configstore.js';

/**
 * Retrieves stored user data values from env variables or configstore,
 * with env variables taking precedent
 */
export default function getCurrentConfig(this: Hook.Context): {
  apiKey?: string;
  email?: string;
  project?: string;
} {
  const apiKey = (() => {
    if (process.env.RDME_API_KEY) {
      this.debug('using RDME_API_KEY env var for api key');
      return process.env.RDME_API_KEY;
    } else if (process.env.README_API_KEY) {
      this.debug('using README_API_KEY env var for api key');
      return process.env.README_API_KEY;
    } else {
      this.debug('falling back to configstore value for api key');
      return configstore.get('apiKey');
    }
  })();

  const email = (() => {
    if (process.env.RDME_EMAIL) {
      this.debug('using RDME_EMAIL env var for email');
      return process.env.RDME_EMAIL;
    } else {
      this.debug('falling back to configstore value for email');
      return configstore.get('email');
    }
  })();

  const project = (() => {
    if (process.env.RDME_PROJECT) {
      this.debug('using RDME_PROJECT env var for project');
      return process.env.RDME_PROJECT;
    } else {
      this.debug('falling back to configstore value for project');
      return configstore.get('project');
    }
  })();

  return { apiKey, email, project };
}
