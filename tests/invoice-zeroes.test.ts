import { test, expect } from '@playwright/test';
import { deleteUser, login } from './login';
import { screenshotTest } from './utils';
import { fillNewInvoice, validateInvoice } from './invoices';
import { setZeroes } from './settings';

test.describe('Invoice zeroes test', () => {
  test('should create invoice', async ({ page }) => {
    await login(page);

    await Promise.all([
      page.click('text="Nustatymai"'),
      page.waitForNavigation({ url: 'http://localhost:3000/nustatymai' }),
    ]);

    await setZeroes(page, '6');

    const invoice = {
      seriesName: 'TRS',
      seriesId: 69,
      created: Date.UTC(2021, 1, 1),
      price: 50,
      buyer: 'Pūkuotukas',
      seller: 'Triušis',
      issuer: 'Triušis',
      extra: 'Apmokėti morkų sėklomis',
      language: 'lt',
      lineItems: [
        { name: 'Bičių medus', unit: 'vnt.', amount: 1, price: 12.34 },
      ],
    };

    await page.goto('http://localhost:3000/saskaitos/nauja');

    await fillNewInvoice(page, invoice);

    await page.click('[aria-label="Sukurti"]');

    await page.waitForNavigation();
    expect(
      page.url().startsWith('http://localhost:3000/saskaitos/id/'),
    ).toBeTruthy();

    await page.waitForSelector('text="Sąskaita faktūra sukurta"');
    await validateInvoice(page, invoice);

    const el = await page.waitForSelector('[aria-label="PDF nuoroda"]');
    const href = await el.evaluate((e) => e.getAttribute('value'));
    await page.goto(`http://localhost:3000/pdfviewer.html?pdf=${href}`);
    await page.waitForSelector('text=rendered');

    await screenshotTest(page, 'invoice-zeroes');

    await deleteUser(page);
  });
});
