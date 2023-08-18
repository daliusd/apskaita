export async function setZeroes(page, zeroes) {
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
