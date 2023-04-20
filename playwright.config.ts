import { PlaywrightTestConfig } from '@playwright/test';
const config: PlaywrightTestConfig = {
  testDir: 'tests',
  expect: {
    timeout: 10000,
  },
  retries: 1,
  webServer: {
    command: 'PORT=3000 yarn start-with-port',
    port: 3000,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
};
export default config;
