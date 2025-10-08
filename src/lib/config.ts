const config = {
  host: {
    v1: process.env.RDME_LOCALHOST ? 'http://dash.readme.local:3000' : 'https://dash.readme.com',
    v2: process.env.RDME_LOCALHOST ? 'http://api.readme.local:3000/v2' : 'https://api.readme.com/v2',
  },
} as const;

export default config;
