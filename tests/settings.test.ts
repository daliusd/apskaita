import { login } from './login';
import { validateTextArea, validateInput } from './utils';

describe('Settings test', () => {
  beforeAll(async () => {
    await page.goto('http://localhost:4000');
  });

  it('should save settings', async () => {
    await login(page);

    await page.click('text="Nustatymai"');
    await page.waitForNavigation(/*{ url: 'http://localhost:3000/nustatymai' }*/);

    await page.click(
      'textarea[aria-label="Tavo rekvizitai sąskaitai faktūrai"]',
    );
    await page.fill(
      'textarea[aria-label="Tavo rekvizitai sąskaitai faktūrai"]',
      'mano rekvizitai',
    );
    await page.click('text="Išsaugoti rekvizitus"');

    await page.click(
      'input[aria-label="Asmuo įprastai išrašantis sąskaitas faktūras"]',
    );
    await page.fill(
      'input[aria-label="Asmuo įprastai išrašantis sąskaitas faktūras"]',
      'vardenis pavardenis',
    );
    await page.click('text="Išsaugoti"');

    await page.click(
      'textarea[aria-label="Papildoma informacija sąskaitoje faktūroje"]',
    );
    await page.fill(
      'textarea[aria-label="Papildoma informacija sąskaitoje faktūroje"]',
      'papildoma informacija',
    );
    await page.click(
      'button[aria-label="Išsaugoti papildomą informaciją"] >> text="Išsaugoti"',
    );

    await page.click(
      'input[aria-label="Skaitmenų skaičius sąskaitos faktūros serijos numeryje"]',
    );
    await page.fill(
      'input[aria-label="Skaitmenų skaičius sąskaitos faktūros serijos numeryje"]',
      '3',
    );
    await page.click(
      'button[aria-label="Išsaugoti skaitmenų skaičių"] >> text="Išsaugoti"',
    );

    await page.goto('http://localhost:4000/nustatymai');

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
