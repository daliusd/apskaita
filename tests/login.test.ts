import { test } from '@playwright/test';
import { deleteUser, login } from './login';

test.describe('Login test', () => {
  test('should login', async ({ page }) => {
    const email = await login(page);

    await page.waitForSelector('text=Esi prisijungęs');
    await page.waitForSelector(`text=${email}`);

    await deleteUser(page);
  });
});
