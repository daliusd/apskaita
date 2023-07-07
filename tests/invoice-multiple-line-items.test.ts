import { test, expect } from '@playwright/test';
import { deleteUser, login } from './login';
import { screenshotTest } from './utils';
import { fillNewInvoice, validateInvoice } from './invoices';

test('Invoice. Should create invoice with multiple items', async ({ page }) => {
  await login(page);

  const invoice = {
    seriesName: 'TEST',
    seriesId: 0,
    created: Date.UTC(2020, 0, 31),
    price: 60,
    buyer: 'Dalius',
    seller: 'Jonas',
    issuer: 'Jonas',
    extra: 'Apmokėti per 10 dienų',
    language: 'lt',
    lineItems: [
      { name: 'Konsultacija', unit: 'val.', amount: 2, price: 25 },
      { name: 'Testavimas', unit: 'val.', amount: 1, price: 20 },
    ],
  };

  await Promise.all([
    page.click('text="Nauja sąskaita faktūra"'),
    page.waitForNavigation({
      url: 'http://localhost:3000/saskaitos/nauja',
    }),
  ]);

  await fillNewInvoice(page, invoice);

  await page.click('[aria-label="Sukurti"]');

  await page.waitForNavigation();
  expect(
    page.url().startsWith('http://localhost:3000/saskaitos/id/'),
  ).toBeTruthy();

  await page.waitForSelector('text="Sąskaita faktūra sukurta"');

  invoice.seriesId = 1; // new series starts with 1
  await validateInvoice(page, invoice);

  const el = await page.waitForSelector('[aria-label="PDF nuoroda"]');
  const href = await el.evaluate((e) => e.getAttribute('value'));
  expect(href).toMatch(
    new RegExp(
      `^http://localhost:3000/api/pdf/[0-9a-f-]*.pdf/${
        invoice.seriesName
      }${invoice.seriesId.toString().padStart(6, '0')}.pdf$`,
    ),
  );
  await page.goto(`http://localhost:3000/pdfviewer.html?pdf=${href}`);
  await page.waitForSelector('text=_');

  await screenshotTest(page, 'invoice-multiple-line-items');

  await deleteUser(page);
});
