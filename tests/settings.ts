import { Page } from 'playwright';

export async function setSeller(page: Page, seller: string) {
  await page.click('textarea[aria-label="Tavo rekvizitai sąskaitai faktūrai"]');
  await page.fill(
    'textarea[aria-label="Tavo rekvizitai sąskaitai faktūrai"]',
    seller,
  );
  await page.click('[aria-label="Išsaugoti rekvizitus"]');
}

export async function setIssuer(page: Page, issuer: string) {
  await page.click(
    'input[aria-label="Asmuo įprastai išrašantis sąskaitas faktūras"]',
  );
  await page.fill(
    'input[aria-label="Asmuo įprastai išrašantis sąskaitas faktūras"]',
    issuer,
  );
  await page.click('[aria-label="Išsaugoti asmenį išrašantį sąskaitas"]');
}

export async function setExtra(page: Page, extra: string) {
  await page.click(
    'textarea[aria-label="Papildoma informacija sąskaitoje faktūroje"]',
  );
  await page.fill(
    'textarea[aria-label="Papildoma informacija sąskaitoje faktūroje"]',
    extra,
  );
  await page.click('[aria-label="Išsaugoti papildomą informaciją"]');
}

export async function setZeroes(page: Page, zeroes: string) {
  await page.click(
    'input[aria-label="Skaitmenų skaičius sąskaitos faktūros serijos numeryje"]',
  );
  await page.fill(
    'input[aria-label="Skaitmenų skaičius sąskaitos faktūros serijos numeryje"]',
    zeroes,
  );
  await page.click(
    'button[aria-label="Išsaugoti skaitmenų skaičių"] >> text="Išsaugoti"',
  );
}
