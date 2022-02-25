const config = require('config');
const { getProjectVersion } = require('../../lib/versionSelect');
const fetch = require('../../lib/fetch');
const { cleanHeaders, handleRes } = require('../../lib/fetch');
const { debug } = require('../../lib/logger');

module.exports = class DeleteVersionCommand {
  constructor() {
    this.command = 'versions:delete';
    this.usage = 'versions:delete --version=<version> [options]';
    this.description = 'Delete a version associated with your ReadMe project.';
    this.category = 'versions';
    this.position = 4;

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
    ];
  }

  async run(opts) {
    const { key, version } = opts;

    debug(`command: ${this.command}`);
    debug(`opts: ${JSON.stringify(opts)}`);

    if (!key) {
      return Promise.reject(new Error('No project API key provided. Please use `--key`.'));
    }

    const selectedVersion = await getProjectVersion(version, key, false).catch(e => {
      return Promise.reject(e);
    });

    debug(`selectedVersion: ${selectedVersion}`);

    return fetch(`${config.get('host')}/api/v1/version/${selectedVersion}`, {
      method: 'delete',
      headers: cleanHeaders(key),
    })
      .then(handleRes)
      .then(() => {
        return Promise.resolve(`Version ${selectedVersion} deleted successfully.`);
      });
  }
};
