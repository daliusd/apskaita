import { test, expect } from '@playwright/test';
import { deleteUser, login } from './login';
import { screenshotTest } from './utils';
import { fillNewInvoice, validateInvoice } from './invoices';

test.describe('Settings test', () => {
  test('should create invoice', async ({ page }) => {
    await login(page);

    const invoice = {
      seriesName: 'TEST',
      seriesId: 0,
      created: Date.UTC(2020, 0, 31),
      price: 50,
      buyer: 'Dalius',
      seller: 'Jonas',
      issuer: 'Jonas',
      extra: 'Kindly pay your invoice within 10 days',
      language: 'en',
      lineItems: [{ name: 'Therapy session', unit: 'h', amount: 2, price: 26 }],
    };

    await Promise.all([
      page.click('text="Nauja sąskaita faktūra"'),
      page.waitForNavigation({
        url: 'http://localhost:3000/saskaitos/nauja',
      }),
    ]);

    await fillNewInvoice(page, invoice);

    await Promise.all([
      page.click('[aria-label="Sukurti"]'),
      page.waitForNavigation(),
    ]);

    expect(
      page.url().startsWith('http://localhost:3000/saskaitos/id/'),
    ).toBeTruthy();

    await page.waitForSelector('text="Sąskaita faktūra sukurta"');

    invoice.seriesId = 1; // new series starts with 1
    await validateInvoice(page, invoice);

    const el = await page.waitForSelector('[aria-label="PDF nuoroda"]');
    const href = await el.evaluate((e) => e.getAttribute('value'));
    await page.goto(`http://localhost:3000/pdfviewer.html?pdf=${href}`);
    await page.waitForSelector('text=rendered');

    await screenshotTest(page, 'invoice-simple-english');

    await deleteUser(page);
  });
});
