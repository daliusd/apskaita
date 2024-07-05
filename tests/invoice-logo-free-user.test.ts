import { test, expect } from '@playwright/test';
import { deleteUser, login } from './login';
import { screenshotTest } from './utils';
import { fillNewInvoice } from './invoices';

test('Invoice. Should create invoice without logo for free user', async ({
  page,
}) => {
  await login(page);

  await page.goto('http://localhost:3000/nustatymai');
  await page.waitForSelector('text="Pakeisti logo"');
  await page.setInputFiles(
    'label[aria-label="Pakeisti logo"] input',
    './public/logo.png',
  );
  await page.waitForSelector('img[alt="logo"]');

  const invoice = {
    seriesName: 'TEST',
    seriesId: 1,
    created: Date.UTC(2020, 0, 31),
    price: 50,
    buyer: 'Dalius',
    seller: 'Jonas',
    issuer: 'Jonas',
    extra: 'Apmokėti per 10 dienų',
    language: 'lt',
    lineItems: [{ name: 'Konsultacija', unit: 'val.', amount: 2, price: 25 }],
  };

  await page.goto('http://localhost:3000/saskaitos/nauja');
  await fillNewInvoice(page, invoice);
  await page.click('[aria-label="Sukurti"]');

  await page.waitForNavigation();
  await page.waitForSelector('text="Sąskaita faktūra sukurta"');

  const el = await page.waitForSelector('[aria-label="PDF nuoroda"]');
  const href = await el.evaluate((e) => e.getAttribute('value'));
  await page.goto(`http://localhost:3000/pdfviewer.html?pdf=${href}`);
  await page.waitForSelector('text=_');

  await screenshotTest(page, 'invoice-logo');

  await deleteUser(page);
});
