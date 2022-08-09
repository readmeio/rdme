module.exports = {
  coveragePathIgnorePatterns: ['/dist', '/node_modules'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 90,
      statements: 90,
    },
  },
  globals: {
    'ts-jest': {
      tsconfig: '__tests__/tsconfig.json',
    },
  },
  modulePaths: ['<rootDir>'],
  preset: 'ts-jest/presets/js-with-ts',
  roots: ['<rootDir>'],
  setupFiles: ['./__tests__/set-node-env'],
  setupFilesAfterEnv: ['jest-extended/all'],
  testPathIgnorePatterns: [
    '<rootDir>/dist/',
    '<rootDir>/__tests__/helpers/',
    '<rootDir>/__tests__/get-api-nock',
    '<rootDir>/__tests__/set-node-env',
  ],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(js?|ts?)$',
  transform: {},
};
