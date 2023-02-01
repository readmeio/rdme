/** @type {import('ts-jest').JestConfigWithTsJest} */
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
  modulePaths: ['<rootDir>'],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  roots: ['<rootDir>'],
  setupFiles: ['./__tests__/setup'],
  setupFilesAfterEnv: ['jest-extended/all'],
  testPathIgnorePatterns: [
    '<rootDir>/dist/',
    '<rootDir>/__tests__/helpers/',
    '<rootDir>/__tests__/get-api-nock',
    '<rootDir>/__tests__/setup',
  ],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(js?|ts?)$',
  transform: {
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: '__tests__/tsconfig.json',
      },
    ],
  },
};
