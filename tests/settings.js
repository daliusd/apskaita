async function setSeller(page, seller) {
  await page.click('textarea[aria-label="Tavo rekvizitai sąskaitai faktūrai"]');
  await page.fill(
    'textarea[aria-label="Tavo rekvizitai sąskaitai faktūrai"]',
    seller,
  );
  await page.click('[aria-label="Išsaugoti rekvizitus"]');
}

async function setIssuer(page, issuer) {
  await page.click(
    'input[aria-label="Asmuo įprastai išrašantis sąskaitas faktūras"]',
  );
  await page.fill(
    'input[aria-label="Asmuo įprastai išrašantis sąskaitas faktūras"]',
    issuer,
  );
  await page.click('[aria-label="Išsaugoti asmenį išrašantį sąskaitas"]');
}

async function setExtra(page, extra) {
  await page.click(
    'textarea[aria-label="Papildoma informacija sąskaitoje faktūroje"]',
  );
  await page.fill(
    'textarea[aria-label="Papildoma informacija sąskaitoje faktūroje"]',
    extra,
  );
  await page.click('[aria-label="Išsaugoti papildomą informaciją"]');
}

async function setZeroes(page, zeroes) {
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

module.exports = {
  setSeller,
  setIssuer,
  setExtra,
  setZeroes,
};
