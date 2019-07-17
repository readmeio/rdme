const request = require('request-promise-native');
const config = require('config');
const { validate: isEmail } = require('isemail');
const { promisify } = require('util');
const read = promisify(require('read'));

exports.command = 'login';
exports.desc = 'Login to a ReadMe project';
exports.category = 'services';
exports.weight = 1;
exports.builder = {
  project: {
    description: 'Your ReadMe project subdomain.',
    string: true,
  },
  '2fa': {
    description: 'Your 2FA token.',
    string: true,
  },
};

const configStore = require('../lib/configstore');

const testing = process.env.NODE_ENV === 'testing';

/* istanbul ignore next */
async function getCredentials(opts) {
  return {
    email: await read({ prompt: 'Email:', default: configStore.get('email') }),
    password: await read({ prompt: 'Password:', silent: true }),
    project:
      opts.project ||
      (await read({ prompt: 'Project subdomain:', default: configStore.get('project') })),
    token: opts['2fa'] && (await read({ prompt: '2fa token:' })),
  };
}

exports.handler = async function(opts) {
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

  return request
    .post(`${config.host}/api/v1/login`, {
      json: { email, password, project, token },
    })
    .then(res => {
      configStore.set('apiKey', res.apiKey);
      configStore.set('email', email);
      configStore.set('project', project);

      console.log(`Successfully logged in as ${email.green} in the ${project.blue} project.`);
    })
    .catch(err => {
      if (err.statusCode === 400) {
        return Promise.reject(err.error);
      }

      return Promise.reject(err);
    });
};
