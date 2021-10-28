import { test, expect } from '@playwright/test';
import { deleteUser, login } from './login';
import { fillNewInvoice } from './invoices';

async function testIfDisabled(page, ariaLabel) {
  await page.waitForSelector(`[aria-label="${ariaLabel}"]`);
  const disabled = await page.$eval(
    `[aria-label="${ariaLabel}"]`,
    (el) => el.disabled,
  );
  expect(disabled).toBeTruthy();
}

test('Invoice. Should allow locking invoice', async ({ page }) => {
  await login(page);

  const invoice = {
    seriesName: 'TEST',
    seriesId: 0,
    created: Date.UTC(2020, 0, 31),
    price: 50,
    buyer: 'Dalius',
    seller: 'Jonas',
    issuer: 'Jonas',
    extra: 'Apmokėti per 10 dienų',
    language: 'lt',
    lineItems: [
      { name: 'Konsultacija', unit: 'val.', amount: 2, price: 25 },
      { name: 'Praktika', unit: 'val.', amount: 2, price: 30 },
    ],
  };

  await Promise.all([
    page.click('text="Nauja sąskaita faktūra"'),
    page.waitForNavigation({
      url: 'http://localhost:3000/saskaitos/nauja',
    }),
  ]);

  await fillNewInvoice(page, invoice);

  await page.click('[aria-label="Sukurti"]');

  await page.waitForNavigation();
  expect(
    page.url().startsWith('http://localhost:3000/saskaitos/id/'),
  ).toBeTruthy();

  await page.waitForSelector('text="Sąskaita faktūra sukurta"');

  await page.click('text="Užrakinta"');

  await page.waitForSelector('input[name="locked"]:checked');

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

  await page.click('text="Užrakinta"');
  await page.waitForSelector('input[name="locked"]:not(checked)');

  await deleteUser(page);
});
