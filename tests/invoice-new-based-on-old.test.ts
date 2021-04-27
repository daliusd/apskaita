import { deleteUser, login } from './login';
import { fillNewInvoice, validateInvoice } from './invoices';

import { IInvoice } from '../db/db';
import { getMsSinceEpoch } from '../utils/date';

describe('Creating new invoice based on old', () => {
  beforeAll(async () => {
    await page.goto('http://localhost:3000');
  });

  afterAll(async () => {
    await deleteUser(page);
  });

  it('should create invoice based on old one', async () => {
    await login(page);

    const date = new Date();
    date.setDate(date.getDate() - 1);

    const invoice: IInvoice = {
      seriesName: 'TEST',
      seriesId: 0,
      created: Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
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
      url: 'http://localhost:3000/saskaitos/nauja',
    });

    await fillNewInvoice(page, invoice);

    await Promise.all([
      page.waitForNavigation(),
      page.click('[aria-label="Sukurti"]'),
    ]);

    expect(
      page.url().startsWith('http://localhost:3000/saskaitos/id/'),
    ).toBeTruthy();

    await page.waitForSelector('text="Sąskaita faktūra sukurta"');

    await Promise.all([
      page.waitForNavigation({ url: 'http://localhost:3000/saskaitos' }),
      page.click('text="Sąskaitos"'),
    ]);

    await Promise.all([
      page.waitForNavigation(/*{ url: 'http://localhost:3000/saskaitos/nauja?sourceId=1' }*/),
      page.click('text="Nauja SF šios pagrindu"'),
    ]);

    expect(
      page.url().startsWith('http://localhost:3000/saskaitos/nauja?sourceId='),
    ).toBeTruthy();

    invoice.seriesId = 2; // cloned invoice should have next series id
    invoice.created = getMsSinceEpoch(new Date());
    await validateInvoice(page, invoice);
  });
});
