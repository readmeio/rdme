const path = require('path');

module.exports = {
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 90,
      statements: 90,
    },
  },
  moduleNameMapper: {
    // https://github.com/facebook/jest/issues/12270#issuecomment-1111533936
    chalk: require.resolve('chalk'),
    '#ansi-styles': path.join(require.resolve('chalk').split('chalk')[0], 'chalk/source/vendor/ansi-styles/index.js'),
    '#supports-color': path.join(
      require.resolve('chalk').split('chalk')[0],
      'chalk/source/vendor/supports-color/index.js'
    ),
  },
  setupFiles: ['./__tests__/set-node-env'],
  testPathIgnorePatterns: ['./__tests__/get-api-nock', './__tests__/set-node-env'],
};
