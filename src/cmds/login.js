const chalk = require('chalk');
const config = require('config');
const { validate: isEmail } = require('isemail');
const { promisify } = require('util');
const read = promisify(require('read'));
const configStore = require('../lib/configstore');
const { handleRes } = require('../lib/handleRes');
const fetch = require('node-fetch');

const testing = process.env.NODE_ENV === 'testing';

exports.command = 'login';
exports.usage = 'login [options]';
exports.description = 'Login to a ReadMe project.';
exports.category = 'admin';
exports.position = 1;

exports.args = [
  {
    name: 'project',
    type: String,
    description: 'Project subdomain',
  },
  {
    name: '2fa',
    type: Boolean,
    description: 'Prompt for a 2FA token',
  },
];

/* istanbul ignore next */
async function getCredentials(opts) {
  return {
    email: await read({ prompt: 'Email:', default: configStore.get('email') }),
    password: await read({ prompt: 'Password:', silent: true }),
    project: opts.project || (await read({ prompt: 'Project subdomain:', default: configStore.get('project') })),
    token: opts['2fa'] && (await read({ prompt: '2fa token:' })),
  };
}

exports.run = async function (opts) {
  let { email, password, project, token } = opts;

  // We only want to prompt for input outside of the test environment
  /* istanbul ignore next */
  if (!testing) {
    ({ email, password, project, token } = await getCredentials(opts));
  }

  if (!project) {
    return Promise.reject(new Error('No project subdomain provided. Please use `--project`.'));
  }

  if (!isEmail(email)) {
    return Promise.reject(new Error('You must provide a valid email address.'));
  }

  return fetch(`${config.get('host')}/api/v1/login`, {
    method: 'post',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      project,
      token,
    }),
  })
    .then(handleRes)
    .then(res => {
      configStore.set('apiKey', res.apiKey);
      configStore.set('email', email);
      configStore.set('project', project);

      return `Successfully logged in as ${chalk.green(email)} to the ${chalk.blue(project)} project.`;
    });
};
