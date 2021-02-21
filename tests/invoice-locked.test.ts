import { Page } from 'playwright';

import { login } from './login';
import { fillNewInvoice } from './invoices';

import { IInvoice } from '../db/db';

async function testIfDisabled(page: Page, ariaLabel: string) {
  await page.waitForSelector(`[aria-label="${ariaLabel}"]`);
  const disabled = await page.$eval(
    `[aria-label="${ariaLabel}"]`,
    (el) => (el as HTMLInputElement).disabled,
  );
  expect(disabled).toBeTruthy();
}

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
      lineItems: [
        { name: 'Konsultacija', unit: 'val.', amount: 2, price: 25 },
        { name: 'Praktika', unit: 'val.', amount: 2, price: 30 },
      ],
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

    await page.click('text="Sąskaita faktūra atrakinta"');

    await page.waitForSelector('text="Sąskaita faktūra užrakinta"');

    await testIfDisabled(page, 'Serijos pavadinimas');
    await testIfDisabled(page, 'Serijos numeris');
    await testIfDisabled(page, 'Sąskaitos data');

    await testIfDisabled(page, 'Pardavėjas');
    await testIfDisabled(page, 'Pirkėjas');
    await testIfDisabled(page, 'SF išrašė');
    await testIfDisabled(page, 'Papildoma informacija');

    for (let i = 0; i < invoice.lineItems.length; i++) {
      const pid = ` ${i + 1}`;

      await testIfDisabled(page, `Paslaugos pavadinimas${pid}`);
      await testIfDisabled(page, `Matas${pid}`);
      await testIfDisabled(page, `Kiekis${pid}`);
      await testIfDisabled(page, `Kaina${pid}`);
    }

    await page.click('text="Sąskaita faktūra užrakinta"');
    await page.waitForSelector('text="Sąskaita faktūra atrakinta"');
  });
});
