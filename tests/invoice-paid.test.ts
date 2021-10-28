import { test, expect } from '@playwright/test';
import { deleteUser, login } from './login';
import { fillNewInvoice } from './invoices';

test('Invoice. Should mark invoice as paid', async ({ page }) => {
  await login(page);

  const invoice = {
    seriesName: 'TEST',
    seriesId: 0,
    created: Date.UTC(2020, 0, 31),
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

  await page.click('text="Apmokėta"');
  await page.waitForSelector('input[name="paid"]:checked');

  await page.click('text="Apmokėta"');
  await page.waitForSelector('input[name="paid"]:not(checked)');

  await page.click('text="Apmokėta"');
  await page.waitForSelector('input[name="paid"]:checked');

  await deleteUser(page);
});
