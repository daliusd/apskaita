module.exports = {
  preset: 'jest-playwright-preset',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testMatch: ['<rootDir>/tests/*.test.ts'],
  testTimeout: 30000,
  verbose: true,
};
