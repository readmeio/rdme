exports.config = function(env = 'config') {
  // eslint-disable-next-line global-require, import/no-dynamic-require
  return require(`./config/${env}`);
};
