const { spawn } = require('child_process');
const path = require('path');

exports.command = 'oas';
exports.usage = 'oas';
exports.description = 'Helpful OpenAPI generation tooling.';
exports.category = 'utilities';
exports.position = 1;

exports.args = [];

exports.run = function () {
  const cp = spawn(path.join(__dirname, '..', '..', 'node_modules', '.bin', 'oas'), process.argv.slice(3), {
    stdio: 'inherit',
  });

  return new Promise((resolve, reject) => {
    cp.on('close', code => {
      if (code && code > 0) return reject();

      return resolve();
    });
  });
};
