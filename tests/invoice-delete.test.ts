import { login } from './login';
import { fillNewInvoice } from './invoices';

import { IInvoice } from '../db/db';

describe('Delete test', () => {
  beforeAll(async () => {
    await page.goto('http://localhost:4000');
  });

  it('should delete invoice', async () => {
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

    await page.click('text="Trinti"');
    await page.click('text="Nutraukti"');
    await page.click('text="Trinti"');
    await page.click('div[role="dialog"] >> text="Trinti"');

    await page.waitForNavigation({ url: 'http://localhost:4000/saskaitos' });
    await page.click('text="Jūs neturite sąskaitų faktūrų."');
  });
});
