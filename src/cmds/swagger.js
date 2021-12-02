const openapi = require('./openapi');

exports.command = 'swagger';
exports.usage = 'swagger [file] [options]';
exports.description = 'Alias for `rdme openapi`. [deprecated]';
exports.category = openapi.category;
exports.position = openapi.position + 1;

exports.hiddenArgs = openapi.hiddenArgs;
exports.args = openapi.args;

exports.run = async function (opts) {
  console.warn('`rdme swagger` has been deprecated. Please use `rdme openapi` instead.');
  return openapi.run(opts);
};
