import { test } from '@playwright/test';
import { deleteUser, login } from './login';
import { validateTextArea, validateInput } from './utils';
import { setSeller, setIssuer, setExtra, setZeroes } from './settings';

test('Should save settings', async ({ page }) => {
  await login(page);

  await Promise.all([
    page.click('text="Nustatymai"'),
    page.waitForURL('http://localhost:3000/nustatymai'),
  ]);

  await setSeller(page, 'mano rekvizitai');
  await setIssuer(page, 'vardenis pavardenis');
  await setExtra(page, 'papildoma informacija');
  await setZeroes(page, '3');

  await page.goto('http://localhost:3000/nustatymai');

  await page.waitForSelector(
    '[aria-label="Papildoma informacija sąskaitoje faktūroje"] >> text="papildoma informacija"',
  );

  await validateTextArea(
    page,
    'Tavo rekvizitai sąskaitai faktūrai',
    'mano rekvizitai',
  );

  await validateInput(
    page,
    'Asmuo įprastai išrašantis sąskaitas faktūras',
    'vardenis pavardenis',
  );

  await validateTextArea(
    page,
    'Papildoma informacija sąskaitoje faktūroje',
    'papildoma informacija',
  );

  await validateInput(
    page,
    'Skaitmenų skaičius sąskaitos faktūros serijos numeryje',
    '3',
  );

  await deleteUser(page);
});
