import { test } from '@playwright/test';
import { deleteUser, login } from './login';
import { validateInput, validateTextArea } from './utils';

test('Invoice. Always use default seller', async ({ page }) => {
  await login(page);

  await Promise.all([
    page.waitForNavigation(),
    page.click('text="Nauja sąskaita faktūra"'),
  ]);

  await page.fill('[aria-label="Serijos pavadinimas"]', 'ZZ');

  await page.click('textarea[aria-label="Pirkėjas"]');
  await page.fill('textarea[aria-label="Pirkėjas"]', 'Matas Matauskas');

  await page.click('textarea[aria-label="Pardavėjas"]');
  await page.fill('textarea[aria-label="Pardavėjas"]', 'Mano rekvizitai');

  await page.click('input[aria-label="SF išrašė"]');
  await page.fill('input[aria-label="SF išrašė"]', 'Mikė Pūkuotukas');

  await page.click('textarea[aria-label="Papildoma informacija"]');
  await page.fill(
    'textarea[aria-label="Papildoma informacija"]',
    'Nekreipk dėmesio',
  );

  await page.click('input[aria-label="Paslaugos pavadinimas 1"]');
  await page.fill('input[aria-label="Paslaugos pavadinimas 1"]', 'Testavimas');

  await page.fill('input[aria-label="Kaina 1"]', '10');

  await page.click('[aria-label="Sukurti"]');
  await page.waitForNavigation();
  await page.waitForSelector('text="Sąskaita faktūra sukurta"');

  await page.goto('http://localhost:3000/saskaitos');

  await Promise.all([
    page.waitForNavigation(),
    page.click('text="Nauja SF šios pagrindu"'),
  ]);

  await validateTextArea(page, 'Pardavėjas', 'Mano rekvizitai');
  await validateInput(page, 'SF išrašė', 'Mikė Pūkuotukas');
  await validateTextArea(page, 'Papildoma informacija', 'Nekreipk dėmesio');

  await deleteUser(page);
});
