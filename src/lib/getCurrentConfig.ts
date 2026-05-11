import type { Hook } from '@oclif/core';

import configstore from './configstore.js';

export function normalizeAPIKey(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

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
    const rdmeAPIKey = normalizeAPIKey(process.env.RDME_API_KEY);
    if (rdmeAPIKey) {
      this.debug('using RDME_API_KEY env var for api key');
      return rdmeAPIKey;
    }

    const readmeAPIKey = normalizeAPIKey(process.env.README_API_KEY);
    if (readmeAPIKey) {
      this.debug('using README_API_KEY env var for api key');
      return readmeAPIKey;
    }

    this.debug('falling back to configstore value for api key');
    return normalizeAPIKey(configstore.get<string>('apiKey'));
  })();

  const email = (() => {
    if (process.env.RDME_EMAIL) {
      this.debug('using RDME_EMAIL env var for email');
      return process.env.RDME_EMAIL;
    }

    this.debug('falling back to configstore value for email');
    return configstore.get<string>('email');
  })();

  const project = (() => {
    if (process.env.RDME_PROJECT) {
      this.debug('using RDME_PROJECT env var for project');
      return process.env.RDME_PROJECT;
    }

    this.debug('falling back to configstore value for project');
    return configstore.get<string>('project');
  })();

  return { apiKey, email, project };
}
