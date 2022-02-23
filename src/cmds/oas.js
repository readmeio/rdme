const { spawn } = require('child_process');
const path = require('path');
const { debug } = require('../lib/logger');

module.exports = class OASCommand {
  constructor() {
    this.command = 'oas';
    this.usage = 'oas';
    this.description = 'Helpful OpenAPI generation tooling.';
    this.category = 'utilities';
    this.position = 1;

    this.args = [];
  }

  async run() {
    debug(`command: ${this.command}`);
    debug('spawning new process with `oas`');

    const cp = spawn(path.join(__dirname, '..', '..', 'node_modules', '.bin', 'oas'), process.argv.slice(3), {
      stdio: 'inherit',
    });

    return new Promise((resolve, reject) => {
      cp.on('close', code => {
        debug(`closing \`oas\` process with code: ${code}`);
        if (code && code > 0) return reject();

        return resolve();
      });
    });
  }
};
