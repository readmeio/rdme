const config = {
  host: {
    v1: 'https://dash.readme.com',
  },
  hub: 'https://{project}.readme.io', // this is only used for the `rdme open` command
} as const;

export default config;
