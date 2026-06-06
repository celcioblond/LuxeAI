const config = {
  testEnvironment: 'node',
  verbose: true,
  transform: {},
  coverageDirectory: 'coverage',
  testMatch: ['**/__tests__/**/*.test.js', '**/*.test.js'],
  globalSetup: '<rootDir>/tests/setup/globalSetup.js',
  globalTeardown: '<rootDir>/tests/setup/globalTeardown.js',
};

export default config;
