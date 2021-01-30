module.exports = {
  preset: 'jest-playwright-preset',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testMatch: ['<rootDir>/tests/*.test.ts'],
  testTimeout: 120000,
  verbose: true,
};
