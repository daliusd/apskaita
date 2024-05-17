import { test, expect } from '@playwright/test';
import { deleteUser, login } from './login';

test('Expenses. Create and edit expenses', async ({ page }) => {
  await login(page);

  await page.goto('http://localhost:3000/');

  await page.getByRole('link', { name: 'Išlaidos' }).click();

  await page.getByRole('button', { name: 'Pridėti išlaidų įrašą' }).click();
  await expect(
    page.getByRole('heading', { name: 'Pridėti išlaidų įrašą' }),
  ).toBeVisible();
  await page.getByLabel('Išlaidų aprašymas').fill('zzz');
  await page.getByLabel('Išlaidų suma').fill('222 €');
  await page.getByLabel('Sąskaitos faktūros numeris').fill('aaa');
  await page.getByLabel('Pardavėjas').fill('bbb');
  await page.getByLabel('Pridėti išlaidų įrašą').click();

  await page.getByRole('link', { name: 'Išlaidos' }).click();
  await page.getByLabel('Keisti').first().click();
  await expect(
    page.getByRole('heading', { name: 'Keisti išlaidų įrašą' }),
  ).toBeVisible();

  await page.getByLabel('Išlaidų aprašymas').fill('qqq');
  await page.getByLabel('Išlaidų suma').fill('333 €');
  await page.getByLabel('Sąskaitos faktūros numeris').fill('nnn');
  await page.getByLabel('Pardavėjas').fill('mmm');
  await page.getByLabel('Keisti išlaidų įrašą').click();

  await page.getByRole('link', { name: 'Išlaidos' }).click();
  await page.getByLabel('Keisti').first().click();
  await expect(
    page.getByRole('heading', { name: 'Keisti išlaidų įrašą' }),
  ).toBeVisible();

  await expect(page.getByLabel('Išlaidų aprašymas')).toHaveValue('qqq');
  await expect(page.getByLabel('Išlaidų suma')).toHaveValue('333 €');
  await expect(page.getByLabel('Sąskaitos faktūros numeris')).toHaveValue(
    'nnn',
  );
  await expect(page.getByLabel('Pardavėjas')).toHaveValue('mmm');

  await deleteUser(page);
});
