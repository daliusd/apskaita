import { login } from './login';
import { screenshotTest } from './utils';
import { fillNewInvoice } from './invoices';

import { IInvoice } from '../db/db';

describe('Settings test', () => {
  beforeAll(async () => {
    await page.goto('http://localhost:4000');
  });

  it('should create invoice with logo', async () => {
    await login(page);

    await page.goto('http://localhost:4000/nustatymai');
    await page.waitForSelector('text="Pakeisti logo"');
    await page.setInputFiles(
      'label[aria-label="Pakeisti logo"] input',
      './tests/testimages/logo_square.png',
    );
    await page.waitForSelector('img[alt="logo"]');

    const invoice: IInvoice = {
      seriesName: 'TEST',
      seriesId: 1,
      created: Date.UTC(2020, 0, 31),
      price: 50,
      buyer: 'Dalius',
      seller: 'Jonas\nadresas\ninfo 1\ninfo 2\ninfo 3',
      issuer: 'Jonas',
      extra: 'Apmokėti per 10 dienų',
      language: 'lt',
      lineItems: [{ name: 'Konsultacija', unit: 'val.', amount: 2, price: 25 }],
    };

    await page.goto('http://localhost:4000/saskaitos/nauja');
    await fillNewInvoice(page, invoice);
    await page.click('[aria-label="Sukurti"]');

    await page.waitForNavigation();
    await page.waitForSelector('text="Sąskaita faktūra sukurta"');

    const el = await page.waitForSelector('[aria-label="PDF nuoroda"]');
    const href = await el.evaluate((e) => e.getAttribute('value'));
    await page.goto(`http://localhost:4000/pdfviewer.html?pdf=${href}`);
    await page.waitForSelector('text=rendered');

    await screenshotTest(page, 'invoice-logo-square');
  });
});
