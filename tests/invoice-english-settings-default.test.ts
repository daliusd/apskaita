import { login } from './login';
import { validateInput, validateTextArea } from './utils';

describe('English settings test', () => {
  beforeAll(async () => {
    await page.goto('http://localhost:4000');
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
    await page.click('text="Išsaugoti rekvizitus"');

    await page.fill(
      'input[aria-label="Asmuo įprastai išrašantis sąskaitas faktūras"]',
      'issuerlt',
    );
    await page.click('text="Išsaugoti"');

    await page.fill(
      'textarea[aria-label="Papildoma informacija sąskaitoje faktūroje"]',
      'extralt',
    );
    await page.click(
      'button[aria-label="Išsaugoti papildomą informaciją"] >> text="Išsaugoti"',
    );

    // Create english invoice
    await Promise.all([
      page.waitForNavigation(),
      page.click('text="Sąskaitos"'),
    ]);

    await Promise.all([
      page.waitForNavigation(),
      page.click('text="Nauja sąskaita faktūra"'),
    ]);

    await page.click('div[aria-label="Kalba"]');
    await page.click('li[aria-label="en"]');

    await page.fill('textarea[aria-label="Pardavėjas"]', 'selleren');
    await page.fill('textarea[aria-label="Pirkėjas"]', 'buyeren');
    await page.fill('input[aria-label="SF išrašė"]', 'issueren');
    await page.fill('textarea[aria-label="Papildoma informacija"]', 'extraen');

    await page.fill('input[aria-label="Paslaugos pavadinimas 1"]', 'Training');
    await page.fill('input[aria-label="Kaina 1"]', '100');

    await Promise.all([page.waitForNavigation(), page.click('text="Sukurti"')]);

    // Check English settings

    await page.click('text="Nustatymai"');
    expect(page.url()).toEqual('http://localhost:4000/nustatymai');

    await page.click('text="Anglų kalbai"');

    validateTextArea(page, 'Tavo rekvizitai sąskaitai faktūrai', 'selleren');
    validateInput(
      page,
      'Asmuo įprastai išrašantis sąskaitas faktūras',
      'issueren',
    );
    validateTextArea(
      page,
      'Papildoma informacija sąskaitoje faktūroje',
      'extraen',
    );
  });
});
