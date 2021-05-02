module.exports = {
  preset: 'jest-playwright-preset',
  testMatch: ['<rootDir>/tests/*.test.js', '<rootDir>/tests/*.test.ts'],
  testTimeout: 30000,
  verbose: true,
  transform: {
    '\\.ts$': ['babel-jest', { configFile: './babel.config.test.js' }],
  },
};
