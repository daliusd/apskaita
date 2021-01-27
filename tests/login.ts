import { Page } from 'playwright';
import { Chance } from 'chance';

const chance = Chance();

export async function login(page: Page) {
  await page.goto('http://localhost:4000/api/auth/signin');

  const email = chance.email({ domain: 'haiku.lt' });
  await page.click('input[name="username"]');
  await page.fill('input[name="username"]', email);

  await page.click('input[name="password"]');
  await page.fill('input[name="password"]', 'testpass');

  await page.click('text="Sign in with Credentials"');

  await page.waitForNavigation({ url: 'http://localhost:4000/' });

  return email;
}
