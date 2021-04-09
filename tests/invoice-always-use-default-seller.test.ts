import { login } from './login';
import { validateInput, validateTextArea } from './utils';

describe('Settings test', () => {
  beforeAll(async () => {
    await page.goto('http://localhost:4000');
  });

  it('should create invoice', async () => {
    await login(page);

    await Promise.all([
      page.waitForNavigation(),
      page.click('text="Nauja sąskaita faktūra"'),
    ]);

    await page.fill('[aria-label="Serijos pavadinimas"]', 'ZZ');

    await page.click('textarea[aria-label="Pirkėjas"]');
    await page.fill('textarea[aria-label="Pirkėjas"]', 'Matas Matauskas');

    await page.click('input[aria-label="Paslaugos pavadinimas 1"]');
    await page.fill(
      'input[aria-label="Paslaugos pavadinimas 1"]',
      'Testavimas',
    );

    await page.fill('input[aria-label="Kaina 1"]', '10');

    await page.click('[aria-label="Sukurti"]');
    await page.waitForNavigation();
    await page.waitForSelector('text="Sąskaita faktūra sukurta"');

    await page.goto('http://localhost:4000/nustatymai');

    await page.fill(
      'textarea[aria-label="Tavo rekvizitai sąskaitai faktūrai"]',
      'Mano rekvizitai',
    );
    await page.click('[aria-label="Išsaugoti rekvizitus"]');

    await page.fill(
      'input[aria-label="Asmuo įprastai išrašantis sąskaitas faktūras"]',
      'Mikė Pūkuotukas',
    );
    await page.click('[aria-label="Išsaugoti asmenį išrašantį sąskaitas"]');

    await page.fill(
      'textarea[aria-label="Papildoma informacija sąskaitoje faktūroje"]',
      'Nekreipk dėmesio',
    );
    await page.click('[aria-label="Išsaugoti papildomą informaciją"]');

    await page.goto('http://localhost:4000/saskaitos');

    await Promise.all([
      page.waitForNavigation(),
      page.click('text="Nauja SF šios pagrindu"'),
    ]);

    await validateTextArea(page, 'Pardavėjas', 'Mano rekvizitai');
    await validateInput(page, 'SF išrašė', 'Mikė Pūkuotukas');
    await validateTextArea(page, 'Papildoma informacija', 'Nekreipk dėmesio');
  });
});
