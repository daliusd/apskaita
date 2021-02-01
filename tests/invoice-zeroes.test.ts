import { login } from './login';
import { screenshotTest } from './utils';
import { fillNewInvoice, validateInvoice } from './invoices';

import { IInvoice } from '../db/db';

import { setZeroes } from './settings';

describe('Settings test', () => {
  beforeAll(async () => {
    await page.goto('http://localhost:4000');
  });

  it('should create invoice', async () => {
    await login(page);

    await page.click('text="Nustatymai"');
    await page.waitForNavigation({ url: 'http://localhost:4000/nustatymai' });

    await setZeroes(page, '6');

    const invoice: IInvoice = {
      seriesName: 'TRS',
      seriesId: 69,
      created: Date.UTC(2021, 1, 1),
      price: 50,
      buyer: 'Pūkuotukas',
      seller: 'Triušis',
      issuer: 'Triušis',
      extra: 'Apmokėti morkų sėklomis',
      lineItems: [
        { name: 'Bičių medus', unit: 'vnt.', amount: 1, price: 12.34 },
      ],
    };

    await page.goto('http://localhost:4000/saskaitos/nauja');

    await fillNewInvoice(page, invoice);

    await page.click('text="Sukurti"');

    await page.waitForNavigation();
    expect(
      page.url().startsWith('http://localhost:4000/saskaitos/id/'),
    ).toBeTruthy();

    await page.waitForSelector('text="Sąskaita faktūra sukurta"');
    await validateInvoice(page, invoice);

    const el = await page.waitForSelector('a[aria-label="PDF failas"]');
    const href = await el.evaluate((e) => e.getAttribute('href'));
    await page.goto(`http://localhost:4000/pdfviewer.html?pdf=${href}`);
    await page.waitForSelector('text=rendered');

    await screenshotTest(page, 'invoice-zeroes');
  });
});
