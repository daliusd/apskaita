import { deleteUser, login } from './login';
import { validateTextArea, validateInput } from './utils';
import { setSeller, setIssuer, setExtra, setZeroes } from './settings';

describe('Settings test', () => {
  beforeAll(async () => {
    await page.goto('http://localhost:3000');
  });

  afterAll(async () => {
    await deleteUser(page);
  });

  it('should save settings', async () => {
    await login(page);

    await page.click('text="Nustatymai"');
    await page.waitForNavigation({ url: 'http://localhost:3000/nustatymai' });

    await setSeller(page, 'mano rekvizitai');
    await setIssuer(page, 'vardenis pavardenis');
    await setExtra(page, 'papildoma informacija');
    await setZeroes(page, '3');

    await page.goto('http://localhost:3000/nustatymai');

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
  });
});
