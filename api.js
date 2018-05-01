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

exports.load = function(config, action = 'start') {
  const file = path.join(__dirname, 'lib', `${action}.js`);
  if (utils.fileExists(file)) {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    return require(file);
  }

  const alias = utils.getAliasFile(action);
  if (alias) {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    return require(path.join(__dirname, 'lib', `${alias}.js`));
  }

  console.error('Action not found.'.red);
  console.warn(`Type ${`${config.cli} help`.yellow} to see all commands`);
  process.exitCode = 1;
  return undefined;
};
