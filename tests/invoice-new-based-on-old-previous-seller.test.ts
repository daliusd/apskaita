import { test, expect } from '@playwright/test';
import { deleteUser, login } from './login';
import { fillNewInvoice, validateInvoice } from './invoices';

function getMsSinceEpoch(date) {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

test('Invoice. Should create invoice based on old one', async ({ page }) => {
  await login(page);

  // Invoice one
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

  await Promise.all([
    page.click('text="Nauja sąskaita faktūra"'),
    page.waitForURL('http://localhost:3000/saskaitos/nauja'),
  ]);

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

  // Invoice 2
  invoice.seller = 'Jonas daugiau info';
  invoice.buyer = 'Simas';

  await Promise.all([
    page.click('text="Nauja sąskaita faktūra"'),
    page.waitForURL('http://localhost:3000/saskaitos/nauja'),
  ]);

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

  // Invoice 3

  await Promise.all([
    page.waitForURL('http://localhost:3000/saskaitos/nauja?sourceId=2*'),
    page.getByLabel('Nauja SF šios pagrindu 2').click(),
  ]);

  invoice.seriesId = 3; // cloned invoice should have next series id
  invoice.created = getMsSinceEpoch(new Date());
  await validateInvoice(page, invoice);

  await page.waitForSelector('[aria-label="Sukurti"]');

  await deleteUser(page);
});
