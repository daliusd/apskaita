import { test, expect } from '@playwright/test';
import { deleteUser, login } from './login';
import { validateInput, validateTextArea } from './utils';

test('Invoice. Should use English settings default', async ({ page }) => {
  await login(page);

  // Create lithuanian invoice
  await Promise.all([
    page.waitForNavigation(),
    page.click('text="Nauja sąskaita faktūra"'),
  ]);

  await page.click('input[aria-label="Serijos pavadinimas"]');
  await page.fill('[aria-label="Serijos pavadinimas"]', 'SS');

  await page.getByRole('textbox', { name: 'Kalba' }).click();
  await page.getByRole('option', { name: 'Lietuvių' }).click();

  await page.fill('textarea[aria-label="Pardavėjas"]', 'seller');
  await page.fill('textarea[aria-label="Pirkėjas"]', 'buyern');
  await page.fill('input[aria-label="SF išrašė"]', 'issuer');
  await page.fill('textarea[aria-label="Papildoma informacija"]', 'extra');

  await page.fill('input[aria-label="Paslaugos pavadinimas 1"]', 'Training');
  await page.fill('input[aria-label="Kaina 1"]', '100');

  await Promise.all([
    page.waitForNavigation(),
    page.click('[aria-label="Sukurti"]'),
  ]);

  // Create english invoice
  await Promise.all([
    page.waitForNavigation(),
    page.click('text="Pagrindinis"'),
  ]);

  await Promise.all([
    page.waitForNavigation(),
    page.click('text="Nauja sąskaita faktūra"'),
  ]);

  await page.click('input[aria-label="Serijos pavadinimas"]');
  await page.fill('[aria-label="Serijos pavadinimas"]', 'SS');

  await page.getByRole('textbox', { name: 'Kalba' }).click();
  await page.getByRole('option', { name: 'Anglų' }).click();

  await page.fill('textarea[aria-label="Pardavėjas"]', 'selleren');
  await page.fill('textarea[aria-label="Pirkėjas"]', 'buyeren');
  await page.fill('input[aria-label="SF išrašė"]', 'issueren');
  await page.fill('textarea[aria-label="Papildoma informacija"]', 'extraen');

  await page.fill('input[aria-label="Paslaugos pavadinimas 1"]', 'Training');
  await page.fill('input[aria-label="Kaina 1"]', '100');

  await Promise.all([
    page.waitForNavigation(),
    page.click('[aria-label="Sukurti"]'),
  ]);

  // Start creating new English invoice and check if English settings are correct
  await Promise.all([
    page.waitForNavigation(),
    page.click('text="Pagrindinis"'),
  ]);

  await Promise.all([
    page.waitForNavigation(),
    page.click('text="Nauja sąskaita faktūra"'),
  ]);

  await page.fill('[aria-label="Serijos pavadinimas"]', 'SS');

  await page.getByRole('textbox', { name: 'Kalba' }).click();
  await page.getByRole('option', { name: 'Anglų' }).click();

  await page.waitForSelector('text=selleren');

  await validateTextArea(page, 'Pardavėjas', 'selleren');
  await validateInput(page, 'SF išrašė', 'issueren');
  await validateTextArea(page, 'Papildoma informacija', 'extraen');

  await deleteUser(page);
});
