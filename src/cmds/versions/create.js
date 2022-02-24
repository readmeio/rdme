const config = require('config');
const semver = require('semver');
const enquirer = require('../../lib/enquirer');

const fetch = require('../../lib/fetch');
const { cleanHeaders, handleRes } = require('../../lib/fetch');

module.exports = class CreateVersionCommand {
  constructor() {
    this.command = 'versions:create';
    this.usage = 'versions:create --version=<version> [options]';
    this.description = 'Create a new version for your project.';
    this.category = 'versions';
    this.position = 2;

    this.hiddenArgs = ['version'];
    this.args = [
      {
        name: 'key',
        type: String,
        description: 'Project API key',
      },
      {
        name: 'version',
        type: String,
        defaultOption: true,
      },
      {
        name: 'fork',
        type: String,
        description: "The semantic version which you'd like to fork from.",
      },
      {
        name: 'codename',
        type: String,
        description: 'The codename, or nickname, for a particular version.',
      },
      {
        name: 'main',
        type: Boolean,
        description: 'Should this version be the primary (default) version for your project?',
      },
      {
        name: 'beta',
        type: Boolean,
        description: 'Is this version in beta?',
      },
      {
        name: 'public',
        type: Boolean,
        description: 'Would you like to make this version public? Any primary version must be public.',
      },
    ];
  }

  async run(opts) {
    const { key, version } = opts;

    if (!key) {
      return Promise.reject(new Error('No project API key provided. Please use `--key`.'));
    }

    if (!version || !semver.valid(semver.coerce(version))) {
      return Promise.reject(
        new Error(`Please specify a semantic version. See \`${config.get('cli')} help ${this.command}\` for help.`)
      );
    }

    let versionList;
    if (!opts.fork) {
      versionList = await fetch(`${config.get('host')}/api/v1/version`, {
        method: 'get',
        headers: cleanHeaders(key),
      }).then(res => handleRes(res));
    }

    const questions = [
      {
        type: 'select',
        name: 'fork',
        message: 'Which version would you like to fork from?',
        skip: () => opts.fork,
        choices: (versionList || [{}]).map(v => ({ message: v.version, value: v.version })),
      },
      {
        type: 'confirm',
        name: 'main',
        message: 'Would you like to make this version the main version for this project?',
        skip: () => 'main' in opts,
      },
      {
        type: 'confirm',
        name: 'beta',
        message: 'Should this version be in beta?',
        skip: () => 'beta' in opts,
      },
      {
        type: 'confirm',
        name: 'public',
        message: 'Would you like to make this version public?',
        skip() {
          return 'public' in opts || opts.main || this.enquirer?.answers?.main;
        },
      },
    ];

    const answers = await enquirer(opts, questions);

    return fetch(`${config.get('host')}/api/v1/version`, {
      method: 'post',
      headers: cleanHeaders(key, {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({
        version,
        codename: opts.codename || '',
        is_stable: opts.main || answers.main,
        is_beta: opts.beta || answers.beta,
        from: opts.fork || answers.fork,
        is_hidden: opts.main || answers.main ? false : !('public' in opts || answers.public),
      }),
    })
      .then(handleRes)
      .then(() => {
        return Promise.resolve(`Version ${version} created successfully.`);
      });
  }
};
