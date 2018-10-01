const request = require('request-promise-native');
const config = require('config');
const read = require('read');
const Configstore = require('configstore');
const { validate: isEmail } = require('isemail');

exports.desc = 'Login to a ReadMe project';
exports.category = 'services';
exports.weight = 1;

const pkg = require('../package.json');

const conf = new Configstore(pkg.name);

function getCredentials() {
  return new Promise((resolve, reject) => {
    read({ prompt: 'Email:', default: conf.get('email') }, (emailErr, email) => {
      if (emailErr) return reject(emailErr);

      return read({ prompt: 'Password:', silent: true }, (passwordErr, password) => {
        if (passwordErr) return reject(passwordErr);

        return resolve({ email, password });
      });
    })
  });
}

exports.run = async function({ opts }) {
  const { project } = opts;

  if (!project) {
    return Promise.reject(new Error('No project subdomain provided. Please use --project'));
  }

  let { email, password } = opts;

  if (!email) {
    ({ email, password } = await getCredentials());
  }

  if (!isEmail(email)) {
    return Promise.reject(new Error('You must provide a valid email address.'));
  }

  function badRequest(err) {
    if (err.statusCode === 400) {
      return Promise.reject(err.error);
    }

    return Promise.reject(err);
  }

  return request.post(`${config.host}/api/v1/login`, {
    json: { email, password, project },
  }).then((res) => {
    conf.set('apiKey', res.apiKey);
    conf.set('email', email);
    conf.set('project', project);
    return `Successfully logged in as ${email.green} in the ${project.blue} project`;
  }).catch(badRequest);
}
