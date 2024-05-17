import { test, expect } from '@playwright/test';
import { deleteUser, login } from './login';

test('Expenses. Simple test', async ({ page }) => {
  await login(page);

  await page.goto('http://localhost:3000/');

  await page.getByRole('link', { name: 'Išlaidos' }).click();
  await page.getByRole('button', { name: 'Pridėti išlaidų įrašą' }).click();
  await expect(
    page.getByRole('heading', { name: 'Pridėti išlaidų įrašą' }),
  ).toBeVisible();
  await page.getByLabel('Išlaidų aprašymas').fill('Test');
  await page.getByLabel('Išlaidų suma').fill('123 €');
  await page.getByLabel('Pridėti išlaidų įrašą').click();
  await page.waitForSelector('text=Išlaidos įrašas pridėtas.');

  await page.getByRole('link', { name: 'Išlaidos' }).click();

  await expect(
    page.getByText(
      'Rasta išlaidų įrašų pagal filtrus: 1. Šių išlaidų įrašų bendra suma 123 €.',
    ),
  ).toBeVisible();

  await page.getByLabel('Ištrinti išlaidų įrašą').click();

  await page.waitForSelector('text=Išlaidų įrašas ištrintas.');
  await expect(
    page.getByText('Nerasta išlaidų įrašų pagal šiuos filtrus.'),
  ).toBeVisible();

  await deleteUser(page);
});
