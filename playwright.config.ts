import { PlaywrightTestConfig } from '@playwright/test';
const config: PlaywrightTestConfig = {
  timeout: 60000,
  testDir: 'tests',
  use: {
    headless: true,
  },
  webServer: {
    command: 'PORT=3000 npm start',
    port: 3000,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
};
export default config;
