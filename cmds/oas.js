const cp = require('child_process');
const path = require('path');
const { promisify } = require('util');

const spawn = promisify(cp.spawn);

exports.command = 'oas';
exports.desc = 'OAS related tasks. See https://npm.im/oas';

exports.handler = function() {
  return spawn(path.join(__dirname, '..', 'node_modules', '.bin', 'oas'), process.argv.slice(3), {
    stdio: 'inherit',
  });
};
