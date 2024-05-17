import { test, expect } from '@playwright/test';
import { deleteUser, login } from './login';

test('Expenses. Sum test', async ({ page }) => {
  await login(page);

  await page.goto('http://localhost:3000/');

  await page.getByRole('link', { name: 'Išlaidos' }).click();

  await expect(page.getByRole('heading', { name: 'Išlaidos' })).toBeVisible();
  await page.getByRole('button', { name: 'Pridėti išlaidų įrašą' }).click();

  await expect(
    page.getByRole('heading', { name: 'Pridėti išlaidų įrašą' }),
  ).toBeVisible();
  await page.getByLabel('Išlaidų aprašymas').fill('1');
  await page.getByLabel('Išlaidų suma').fill('0.01 €');
  await page.getByLabel('Pridėti išlaidų įrašą').click();
  await expect(
    page.getByRole('heading', { name: 'Keisti išlaidų įrašą' }),
  ).toBeVisible();

  await page.getByRole('link', { name: 'Išlaidos' }).click();

  await expect(page.getByRole('heading', { name: 'Išlaidos' })).toBeVisible();
  await page.getByRole('button', { name: 'Pridėti išlaidų įrašą' }).click();

  await expect(
    page.getByRole('heading', { name: 'Pridėti išlaidų įrašą' }),
  ).toBeVisible();
  await page.getByLabel('Išlaidų aprašymas').fill('2');
  await page.getByLabel('Išlaidų suma').fill('0.02 €');
  await page.getByLabel('Pridėti išlaidų įrašą').click();
  await expect(
    page.getByRole('heading', { name: 'Keisti išlaidų įrašą' }),
  ).toBeVisible();

  await page.getByRole('link', { name: 'Išlaidos' }).click();
  await expect(page.getByRole('heading', { name: 'Išlaidos' })).toBeVisible();

  await expect(
    page.getByText(
      'Rasta išlaidų įrašų pagal filtrus: 2. Šių išlaidų įrašų bendra suma 0.03 €.',
    ),
  ).toBeVisible();

  await deleteUser(page);
});
