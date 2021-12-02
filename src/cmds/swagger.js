const openapi = require('./openapi');

exports.command = 'swagger';
exports.usage = 'swagger [file] [options]';
exports.description = 'Alias for `rdme openapi` [deprecated].';
exports.category = 'apis';
exports.position = 2;

exports.hiddenArgs = ['token', 'spec'];
exports.args = [
  {
    name: 'key',
    type: String,
    description: 'Project API key',
  },
  {
    name: 'id',
    type: String,
    description: `Unique identifier for your specification. Use this if you're resyncing an existing specification`,
  },
  {
    name: 'token',
    type: String,
    description: 'Project token. Deprecated, please use `--key` instead',
  },
  {
    name: 'version',
    type: String,
    description: 'Project version',
  },
  {
    name: 'spec',
    type: String,
    defaultOption: true,
  },
];

exports.run = async function (opts) {
  console.warn('`rdme swagger` has been deprecated. Please use `rdme openapi` instead.');
  return openapi.run(opts);
};
