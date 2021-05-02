import { deleteUser, login } from './login';
import { validateInput, validateTextArea } from './utils';

describe('English settings test', () => {
  beforeAll(async () => {
    await page.goto('http://localhost:3000');
  });

  afterAll(async () => {
    await deleteUser(page);
  });

  it('should use english settings', async () => {
    await login(page);

    // set Lithuanian settings
    await Promise.all([
      page.waitForNavigation(),
      page.click('text="Nustatymai"'),
    ]);

    await page.fill(
      'textarea[aria-label="Tavo rekvizitai sąskaitai faktūrai"]',
      'sellerlt',
    );
    await page.click('[aria-label="Išsaugoti rekvizitus"]');

    await page.fill(
      'input[aria-label="Asmuo įprastai išrašantis sąskaitas faktūras"]',
      'issuerlt',
    );
    await page.click('[aria-label="Išsaugoti asmenį išrašantį sąskaitas"]');

    await page.fill(
      'textarea[aria-label="Papildoma informacija sąskaitoje faktūroje"]',
      'extralt',
    );
    await page.click('[aria-label="Išsaugoti papildomą informaciją"]');

    // Create english invoice
    await Promise.all([
      page.waitForNavigation(),
      page.click('text="Sąskaitos"'),
    ]);

    await Promise.all([
      page.waitForNavigation(),
      page.click('text="Nauja sąskaita faktūra"'),
    ]);

    await page.fill('[aria-label="Serijos pavadinimas"]', 'SS');

    await page.click('div[aria-label="Kalba"]');
    await page.click('li[aria-label="en"]');

    await page.fill('textarea[aria-label="Pardavėjas"]', 'selleren');
    await page.fill('textarea[aria-label="Pirkėjas"]', 'buyeren');
    await page.fill('input[aria-label="SF išrašė"]', 'issueren');
    await page.fill('textarea[aria-label="Papildoma informacija"]', 'extraen');

    await page.fill('input[aria-label="Paslaugos pavadinimas 1"]', 'Training');
    await page.fill('input[aria-label="Kaina 1"]', '100');

    await Promise.all([
      page.waitForNavigation(),
      page.click('[aria-label="Sukurti"]'),
    ]);

    // Check English settings

    await page.click('text="Nustatymai"');
    expect(page.url()).toEqual('http://localhost:3000/nustatymai');

    await page.click('text="Anglų kalbai"');

    await page.waitForSelector(
      '[aria-label="Papildoma informacija sąskaitoje faktūroje"] >> text="extraen"',
    );

    await validateTextArea(
      page,
      'Tavo rekvizitai sąskaitai faktūrai',
      'selleren',
    );
    await validateInput(
      page,
      'Asmuo įprastai išrašantis sąskaitas faktūras',
      'issueren',
    );
    await validateTextArea(
      page,
      'Papildoma informacija sąskaitoje faktūroje',
      'extraen',
    );
  });
});
