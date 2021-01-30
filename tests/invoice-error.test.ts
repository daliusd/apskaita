import { login } from './login';
import { fillNewInvoice } from './invoices';

import { IInvoice } from '../db/db';

describe('Settings test', () => {
  beforeAll(async () => {
    await page.goto('http://localhost:4000');
  });

  it('should show errors if user tries to create wrong invoice', async () => {
    await login(page);

    const invoice: IInvoice = {
      seriesName: 'TEST',
      seriesId: 1,
      created: Date.UTC(2021, 0, 30),
      price: 25,
      buyer: 'Dalius',
      seller: 'Jonas',
      issuer: 'Jonas',
      extra: 'Apmokėti per 10 dienų',
      lineItems: [{ name: 'Konsultacija', unit: 'val.', amount: 1, price: 25 }],
    };

    await page.click('text="Nauja sąskaita faktūra"');
    await page.waitForNavigation({
      url: 'http://localhost:4000/saskaitos/nauja',
    });

    await fillNewInvoice(page, invoice);

    await page.click('text="Sukurti"');
    await page.waitForNavigation();

    // Second invoice
    await page.goto('http://localhost:4000/saskaitos/nauja');

    invoice.seriesId = 3;
    invoice.created = Date.UTC(2021, 1, 1);

    await fillNewInvoice(page, invoice);
    await page.click('text="Sukurti"');
    await page.waitForNavigation();

    // Attempts to create invalid invoice
    await page.goto('http://localhost:4000/saskaitos/nauja');

    await page.click('text="Sukurti"');
    await page.click('text="Nurodykite pirkėjo duomenis."');

    await page.fill('input[aria-label="Serijos numeris"]', '3');
    await page.waitForSelector('text=/.*Šis serijos numeris jau naudoj.*/');

    await page.fill('input[aria-label="Serijos numeris"]', '');
    await page.waitForSelector('text=/.*Serijos numeris negali būti tu.*/');

    await page.fill('input[aria-label="Serijos numeris"]', '2');
    await page.fill('input[aria-label="Sąskaitos data"]', '2021-01-29');

    await page.click('text=/.*Data turi būti 2021-01-30 arba vėlesnė.*/');

    await page.fill('input[aria-label="Sąskaitos data"]', '2021-02-02');

    await page.click('text=/.*Data turi būti 2021-02-01 arba ankstesnė.*/');
  });
});
