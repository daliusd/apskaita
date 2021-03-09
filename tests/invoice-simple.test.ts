import { login } from './login';
import { screenshotTest } from './utils';
import { fillNewInvoice, validateInvoice } from './invoices';

import { IInvoice } from '../db/db';

describe('Settings test', () => {
  beforeAll(async () => {
    await page.goto('http://localhost:4000');
  });

  it('should create invoice', async () => {
    await login(page);

    const invoice: IInvoice = {
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
      url: 'http://localhost:4000/saskaitos/nauja',
    });

    await fillNewInvoice(page, invoice);

    await page.click('[aria-label="Sukurti"]');

    await page.waitForNavigation();
    expect(
      page.url().startsWith('http://localhost:4000/saskaitos/id/'),
    ).toBeTruthy();

    await page.waitForSelector('text="Sąskaita faktūra sukurta"');

    invoice.seriesId = 1; // new series starts with 1
    await validateInvoice(page, invoice);

    const el = await page.waitForSelector('[aria-label="PDF nuoroda"]');
    const href = await el.evaluate((e) => e.getAttribute('value'));
    await page.goto(`http://localhost:4000/pdfviewer.html?pdf=${href}`);
    await page.waitForSelector('text=rendered');

    await screenshotTest(page, 'invoice-simple');
  });
});
