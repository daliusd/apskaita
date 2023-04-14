import { test, expect } from '@playwright/test';
import { deleteUser, login } from './login';
import { fillNewInvoice, validateInvoice } from './invoices';

function getMsSinceEpoch(date) {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

test('Invoice. Should create invoice based on old one', async ({ page }) => {
  await login(page);

  const date = new Date();
  date.setDate(date.getDate() - 1);

  const invoice = {
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
  await page.waitForURL('http://localhost:3000/saskaitos/nauja');

  await fillNewInvoice(page, invoice);

  await Promise.all([
    page.waitForURL('http://localhost:3000/saskaitos/id/*'),
    page.click('[aria-label="Sukurti"]'),
  ]);

  await page.waitForSelector('text="Sąskaita faktūra sukurta"');

  await Promise.all([
    page.waitForURL('http://localhost:3000/saskaitos'),
    page.click('text="Sąskaitos" >> visible = true'),
  ]);

  await Promise.all([
    page.waitForURL('http://localhost:3000/saskaitos/nauja?sourceId=*'),
    page.click('text="Nauja SF šios pagrindu"'),
  ]);

  invoice.seriesId = 2; // cloned invoice should have next series id
  invoice.created = getMsSinceEpoch(new Date());
  await validateInvoice(page, invoice);

  await page.waitForSelector('[aria-label="Sukurti"]');

  await deleteUser(page);
});
