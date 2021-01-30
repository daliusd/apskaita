import { Page } from 'playwright';

export async function validateInput(
  page: Page,
  ariaLabel: string,
  expectedValue: string,
) {
  await page.waitForSelector(`input[aria-label="${ariaLabel}"]`);
  expect(
    await page.$eval(
      `input[aria-label="${ariaLabel}"]`,
      (el) => (el as HTMLInputElement).value,
    ),
  ).toEqual(expectedValue);
}

export async function validateTextArea(
  page: Page,
  ariaLabel: string,
  expectedValue: string,
) {
  await page.waitForSelector(`input[aria-label="${ariaLabel}"]`);
  expect(
    await page.$eval(
      `textarea[aria-label="${ariaLabel}"]`,
      (el) => (el as HTMLTextAreaElement).value,
    ),
  ).toEqual(expectedValue);
}
