module.exports = {
  // eslint-disable-next-line global-require
  cli: require('../package.json').name,
  host: 'https://dash.readme.com',
  hub: 'https://{project}.readme.io', // this is only used for the `open` command
};
