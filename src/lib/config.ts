import pkg from '../../package.json' with { type: 'json' };

const config = {
  cli: pkg.name,
  host: 'https://dash.readme.com',
  hub: 'https://{project}.readme.io', // this is only used for the `open` command
} as const;

export default config;
