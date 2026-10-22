const config = {
  testEnvironment: 'node',
  verbose: true,
  // Hooks register users with bcrypt (12 rounds) against an in-memory MongoDB;
  // on a busy machine that can pass Jest's 5s default and fail at random.
  testTimeout: 20000,
  transform: {},
  coverageDirectory: 'coverage',
  testMatch: ['**/__tests__/**/*.test.js', '**/*.test.js'],
  globalSetup: '<rootDir>/tests/setup/globalSetup.js',
  globalTeardown: '<rootDir>/tests/setup/globalTeardown.js',
};

export default config;
