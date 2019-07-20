const cp = require('child_process');
const path = require('path');
const { promisify } = require('util');

const spawn = promisify(cp.spawn);

exports.command = 'oas';
exports.usage = 'oas';
exports.description = 'OAS related tasks. See https://www.npmjs.com/package/oas';
exports.category = 'utilities';
exports.weight = 4;

exports.args = [];

exports.run = function() {
  return spawn(path.join(__dirname, '..', 'node_modules', '.bin', 'oas'), process.argv.slice(3), {
    stdio: 'inherit',
  });
};
