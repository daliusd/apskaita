import { test, expect } from '@playwright/test';
import { deleteUser, login } from './login';
import { fillNewInvoice } from './invoices';

test('Invoice. Should delete invoice', async ({ page }) => {
  await login(page);

  const date = new Date();
  const invoice = {
    seriesName: 'TEST',
    seriesId: 0,
    created: Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
    price: 50,
    buyer: 'Dalius',
    seller: 'Jonas',
    issuer: 'Jonas',
    extra: 'Apmokėti per 10 dienų',
    language: 'lt',
    lineItems: [{ name: 'Konsultacija', unit: 'val.', amount: 2, price: 25 }],
  };

  await page.click('text="Nauja sąskaita faktūra"');
  await page.waitForNavigation({
    url: 'http://localhost:3000/saskaitos/nauja',
  });

  await fillNewInvoice(page, invoice);

  await page.click('[aria-label="Sukurti"]');

  await page.waitForNavigation();
  expect(
    page.url().startsWith('http://localhost:3000/saskaitos/id/'),
  ).toBeTruthy();

  await page.waitForSelector('text="Sąskaita faktūra sukurta"');

  await page.click('text="Trinti"');
  await page.click('text="Nutraukti"');
  await page.click('text="Trinti"');

  await Promise.all([
    page.waitForNavigation({ url: 'http://localhost:3000/saskaitos' }),
    page.click('text="Taip, trinti"'),
  ]);

  await page.waitForSelector(
    'text=Nerasta sąskaitų faktūrų pagal šiuos filtrus.',
  );

  await deleteUser(page);
});
