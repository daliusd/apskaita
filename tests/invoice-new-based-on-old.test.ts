import { login } from './login';
import { fillNewInvoice, validateInvoice } from './invoices';

import { IInvoice } from '../db/db';
import { getMsSinceEpoch } from '../utils/date';

describe('Creating new invoice based on old', () => {
  beforeAll(async () => {
    await page.goto('http://localhost:4000');
  });

  it('should create invoice based on old one', async () => {
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

    await Promise.all([
      page.waitForNavigation({ url: 'http://localhost:4000/saskaitos' }),
      page.click('text="Sąskaitos"'),
    ]);

    await Promise.all([
      page.waitForNavigation(/*{ url: 'http://localhost:3000/saskaitos/nauja?sourceId=1' }*/),
      page.click('text="Nauja SF šios pagrindu"'),
    ]);

    expect(
      page.url().startsWith('http://localhost:4000/saskaitos/nauja?sourceId='),
    ).toBeTruthy();

    invoice.seriesId = 2; // cloned invoice should have next series id
    invoice.created = getMsSinceEpoch(new Date());
    await validateInvoice(page, invoice);
  });
});
