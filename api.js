require('colors');

const path = require('path');

const utils = require('./utils');

exports.api = function(args, opts = {}) {
  const action = args[0];
  const config = utils.config(opts.env);

  const actionObj = exports.load(config, action);

  if (!actionObj) {
    return;
  }

  const info = {
    args,
    opts,
  };

  actionObj.run(config, info);
};

exports.load = function(config, action = 'help') {
  const file = path.join(__dirname, 'lib', `${action}.js`);
  try {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    return require(file);
  } catch (e) {
    console.error('Action not found.'.red);
    console.warn(`Type ${`${config.cli} help`.yellow} to see all commands`);
    process.exitCode = 1;
    return undefined;
  }
};
