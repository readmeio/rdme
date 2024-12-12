const config = {
  host: {
    v1: 'https://dash.readme.com',
    v2: 'https://api.readme.com/v2',
  },
  hub: 'https://{project}.readme.io', // this is only used for the `rdme open` command
} as const;

export default config;
