import { test } from '@playwright/test';
import { deleteUser, login } from './login';
import { validateInput } from './utils';
import { setZeroes } from './settings';

test('Should save settings', async ({ page }) => {
  await login(page);

  await Promise.all([
    page.click('text="Nustatymai"'),
    page.waitForURL('http://localhost:3000/nustatymai'),
  ]);

  await setZeroes(page, '3');

  await page.goto('http://localhost:3000/nustatymai');

  await validateInput(
    page,
    'Skaitmenų skaičius sąskaitos faktūros serijos numeryje',
    '3',
  );

  await deleteUser(page);
});
