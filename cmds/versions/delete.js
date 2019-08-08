const request = require('request-promise-native');
const config = require('config');

exports.command = 'versions:delete';
exports.usage = 'versions:delete --version={project-version} [options]';
exports.description = 'Delete a version associated with your ReadMe project.';
exports.category = 'versions';
exports.position = 4;

exports.hiddenArgs = ['version'];
exports.args = [
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

exports.run = async function(opts) {
  const { key, version } = opts;

  if (!key) {
    return Promise.reject(new Error('No project API key provided. Please use `--key`.'));
  }

  if (!version) {
    return Promise.reject(
      new Error(
        `No version provided. Please specify a semantic version. See \`${config.cli} help ${exports.command}\` for help.`,
      ),
    );
  }

  return request
    .delete(`${config.host}/api/v1/version/${version}`, {
      auth: { user: key },
    })
    .then(() => Promise.resolve(`Version ${version} deleted successfully.`))
    .catch(err => {
      return Promise.reject(
        new Error(
          err.error && err.error.description
            ? err.error.description
            : 'Failed to delete target version.',
        ),
      );
    });
};
