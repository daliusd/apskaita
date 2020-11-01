module.exports = {
  preset: './preset.js',
  testMatch: ['<rootDir>/tests/*.test.ts', '<rootDir>/db/*.test.ts'],
  testTimeout: 30000,
  verbose: true,
};
