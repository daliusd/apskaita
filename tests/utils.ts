import { expect } from '@playwright/test';

export async function validateInput(page, ariaLabel, expectedValue) {
  await page.waitForSelector(`input[aria-label="${ariaLabel}"]`);
  const value = await page.$eval(
    `input[aria-label="${ariaLabel}"]`,
    (el) => el.value,
  );
  expect(value).toEqual(expectedValue);
}

export async function validateTextArea(page, ariaLabel, expectedValue) {
  await page.waitForSelector(`textarea[aria-label="${ariaLabel}"]`);
  const value = await page.$eval(
    `textarea[aria-label="${ariaLabel}"]`,
    (el) => el.value,
  );
  expect(value).toEqual(expectedValue);
}

export async function screenshotTest(page, testName) {
  await page.setViewportSize({ width: 1280, height: 1280 });
  expect(await page.screenshot({ fullPage: true })).toMatchSnapshot(
    `${testName}.png`,
  );
}
