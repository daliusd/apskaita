import { test } from '@playwright/test';
import { deleteUser, login } from './login';

test('Expenses. Create and edit expenses', async ({ page }) => {
  await login(page);

  await page.goto('http://localhost:3000/');

  await Promise.all([
    page.waitForNavigation(/*{ url: 'http://localhost:3000/islaidos' }*/),
    page.click('text=Išlaidos'),
  ]);

  await page.click('button:has-text("Pridėti išlaidų įrašą")');
  await page.fill('[aria-label="Išlaidų aprašymas"]', 'test');
  await page.fill('input[type="number"]', '1');
  await page.click('[aria-label="Pridėti išlaidų įrašą"]');

  await page.click('[aria-label="Keisti"]');

  await page.fill('[aria-label="Išlaidų aprašymas"]', 'test2');
  await page.fill('input[type="number"]', '2');
  await page.click('[aria-label="Pakeisti išlaidų įrašą"]');

  await page.waitForSelector('text=Išlaidų įrašas pakeistas');
  await page.waitForSelector('text=test2');
  await page.waitForSelector('text=Suma: 2 €');

  await deleteUser(page);
});
