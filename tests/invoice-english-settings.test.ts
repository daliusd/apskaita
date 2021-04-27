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

    await Promise.all([
      page.waitForNavigation(),
      page.click('text="Nustatymai"'),
    ]);

    await page.click('text="Anglų kalbai"');

    await page.fill(
      'textarea[aria-label="Tavo rekvizitai sąskaitai faktūrai"]',
      'selleren',
    );
    await page.click('[aria-label="Išsaugoti rekvizitus"]');

    await page.fill(
      'input[aria-label="Asmuo įprastai išrašantis sąskaitas faktūras"]',
      'issueren',
    );
    await page.click('[aria-label="Išsaugoti asmenį išrašantį sąskaitas"]');

    await page.fill(
      'textarea[aria-label="Papildoma informacija sąskaitoje faktūroje"]',
      'extraen',
    );
    await page.click('[aria-label="Išsaugoti papildomą informaciją"]');

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

    await validateTextArea(page, 'Pardavėjas', 'selleren');
    await validateInput(page, 'SF išrašė', 'issueren');
    await validateTextArea(page, 'Papildoma informacija', 'extraen');
  });
});
