module.exports = {
  testMatch: ['<rootDir>/db/*.test.ts', '<rootDir>/utils/*.test.ts'],
  verbose: true,
  transform: {
    '\\.ts$': ['babel-jest', { configFile: './babel.config.test.js' }],
  },
};
