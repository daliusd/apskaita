import { PlaywrightTestConfig } from '@playwright/test';
const config: PlaywrightTestConfig = {
  testDir: 'tests',
  expect: {
    timeout: 10000,
  },
  retries: 3,
  webServer: {
    command: 'PORT=3000 npm start',
    port: 3000,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
};
export default config;
