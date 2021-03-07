import { login } from './login';
import { validateInput, validateTextArea } from './utils';

describe('English settings test', () => {
  beforeAll(async () => {
    await page.goto('http://localhost:4000');
  });

  it('should use english settings', async () => {
    await login(page);

    await Promise.all([
      page.waitForNavigation(),
      page.click('text="Nustatymai"'),
    ]);

    await page.click('text="Anglų kalbai"');

    await page.fill(
      'textarea[aria-label="Tavo rekvizitai sąskaitai faktūrai"]',
      'selleren',
    );
    await page.click('text="Išsaugoti rekvizitus"');

    await page.fill(
      'input[aria-label="Asmuo įprastai išrašantis sąskaitas faktūras"]',
      'issueren',
    );
    await page.click('text="Išsaugoti"');

    await page.fill(
      'textarea[aria-label="Papildoma informacija sąskaitoje faktūroje"]',
      'extraen',
    );
    await page.click(
      'button[aria-label="Išsaugoti papildomą informaciją"] >> text="Išsaugoti"',
    );

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
    await page.waitForTimeout(100);

    validateTextArea(page, 'Pardavėjas', 'selleren');
    validateInput(page, 'SF išrašė', 'issueren');
    validateTextArea(page, 'Papildoma informacija', 'extraen');
  });
});
