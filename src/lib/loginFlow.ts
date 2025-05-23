import chalk from 'chalk';
import isEmail from 'validator/lib/isEmail.js';

import configStore from './configstore.js';
import getCurrentConfig from './getCurrentConfig.js';
import { debug } from './logger.js';
import promptTerminal from './promptWrapper.js';
import { handleAPIv1Res, readmeAPIv1Fetch } from './readmeAPIFetch.js';
import { validateSubdomain } from './validatePromptInput.js';

interface LoginBody {
  email?: string;
  password?: string;
  project?: string;
  token?: string;
}

function loginFetch(body: LoginBody) {
  return readmeAPIv1Fetch('/api/v1/login', {
    method: 'post',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/**
 * The prompt flow for logging a user in and writing the credentials to
 * `configstore`. This is a separate lib function because we reuse it both
 * in the `login` command as well as any time a user omits an API key.
 *
 * @returns A Promise-wrapped string with the logged-in user's credentials
 */
export default async function loginFlow(
  /**
   * An optional one-time passcode, if the user passes one in
   * via a flag to the the `login` command
   */
  otp?: string,
) {
  const storedConfig = getCurrentConfig();
  const { email, password, project } = await promptTerminal([
    {
      type: 'text',
      name: 'email',
      message: 'What is your email address?',
      initial: storedConfig.email,
      validate(val) {
        return isEmail.default(val) ? true : 'Please provide a valid email address.';
      },
    },
    {
      type: 'invisible',
      name: 'password',
      message: 'What is your password?',
    },
    {
      type: 'text',
      name: 'project',
      message: 'What project subdomain are you logging into?',
      initial: storedConfig.project,
      validate: validateSubdomain,
    },
  ]);

  if (!project) {
    return Promise.reject(new Error('No project subdomain provided. Please use `--project`.'));
  }

  if (!isEmail.default(email)) {
    return Promise.reject(new Error('You must provide a valid email address.'));
  }

  const payload: LoginBody = { email, password, project };

  // if the user passed in a `otp` option, include that in the login payload
  if (otp) payload.token = otp;

  return loginFetch(payload)
    .then(handleAPIv1Res)
    .catch(async err => {
      // if the user's login requires 2FA, let's prompt them for the token!
      if (err.code === 'LOGIN_TWOFACTOR') {
        debug('2FA error response, prompting for 2FA code');
        const otpPrompt = await promptTerminal({
          type: 'text',
          name: 'otp',
          message: 'What is your 2FA token?',
        });

        return loginFetch({ email, password, project, token: otpPrompt.otp }).then(handleAPIv1Res);
      }
      throw err;
    })
    .then(res => {
      configStore.set('apiKey', res.apiKey);
      configStore.set('email', email);
      configStore.set('project', project);

      return `Successfully logged in as ${chalk.green(email)} to the ${chalk.blue(project)} project.`;
    });
}
