import { test } from '@playwright/test';
import { deleteUser, login } from './login';
import { screenshotTest } from './utils';
import { fillNewInvoice, validateInvoice } from './invoices';

test('Invoice. Should create VAT invoice', async ({ page }) => {
  await login(page);

  await Promise.all([
    page.click('text="Nustatymai"'),
    page.waitForURL('http://localhost:3000/nustatymai'),
  ]);

  await page.click('[aria-label="PVM mokėtojas"]');

  await page.goto('http://localhost:3000/saskaitos/nauja');

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
    lineItems: [
      { name: 'Konsultacija', unit: 'val.', amount: 1, price: 25, vat: 21 },
      { name: 'Knyga', unit: 'vnt.', amount: 3, price: 25, vat: 9 },
    ],
  };

  await fillNewInvoice(page, invoice);

  await page.click('[aria-label="Sukurti"]');

  await page.waitForURL('http://localhost:3000/saskaitos/id/*');

  await page.waitForSelector('text="Sąskaita faktūra sukurta"');

  invoice.seriesId = 1; // new series starts with 1
  await validateInvoice(page, invoice);

  const el = await page.waitForSelector('[aria-label="PDF nuoroda"]');
  const href = await el.evaluate((e) => e.getAttribute('value'));
  await page.goto(`http://localhost:3000/pdfviewer.html?pdf=${href}`);
  await page.waitForSelector('text=rendered');

  await screenshotTest(page, 'invoice-vat');

  await deleteUser(page);
});
