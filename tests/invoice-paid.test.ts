import { login } from './login';
import { fillNewInvoice } from './invoices';

import { IInvoice } from '../db/db';

describe('Paid test', () => {
  beforeAll(async () => {
    await page.goto('http://localhost:4000');
  });

  it('should mark invoice as paid', async () => {
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
      lineItems: [{ name: 'Konsultacija', unit: 'val.', amount: 2, price: 25 }],
    };

    await page.click('text="Nauja sąskaita faktūra"');
    await page.waitForNavigation({
      url: 'http://localhost:4000/saskaitos/nauja',
    });

    await fillNewInvoice(page, invoice);

    await page.click('text="Sukurti"');

    await page.waitForNavigation();
    expect(
      page.url().startsWith('http://localhost:4000/saskaitos/id/'),
    ).toBeTruthy();

    await page.waitForSelector('text="Sąskaita faktūra sukurta"');

    await page.click('text="Sąskaita faktūra neapmokėta"');
    await page.waitForSelector('text="Sąskaita faktūra apmokėta"');

    await page.reload();

    await page.waitForSelector('text="Sąskaita faktūra apmokėta"');
    await page.click('text="Sąskaita faktūra apmokėta"');
    await page.click('text="Sąskaita faktūra neapmokėta"');
  });
});
