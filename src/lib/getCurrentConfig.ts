import configstore from './configstore';

/**
 * Retrieves stored user data values from env variables or configstore,
 * with env variables taking precedent
 */
export default function getCurrentConfig(): { apiKey?: string; email?: string; project?: string } {
  const apiKey = process.env.RDME_API_KEY || configstore.get('apiKey');
  const email = process.env.RDME_EMAIL || configstore.get('email');
  const project = process.env.RDME_PROJECT || configstore.get('project');

  return { apiKey, email, project };
}
