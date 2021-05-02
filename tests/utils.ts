import fs from 'fs';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

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
  if (!fs.existsSync('./tests/images/golden')) {
    fs.mkdirSync('./tests/images/golden', { recursive: true });
  }
  if (!fs.existsSync('./tests/images/current')) {
    fs.mkdirSync('./tests/images/current', { recursive: true });
  }
  if (!fs.existsSync('./tests/images/diff')) {
    fs.mkdirSync('./tests/images/diff', { recursive: true });
  }

  const testFileName = `./tests/images/current/${testName}.png`;
  const goldenFileName = `./tests/images/golden/${testName}.png`;
  const diffFileName = `./tests/images/diff/${testName}.png`;

  await page.setViewportSize({ width: 1280, height: 1280 });
  await page.screenshot({ path: testFileName, fullPage: true });

  if (!fs.existsSync(goldenFileName)) {
    fs.copyFileSync(testFileName, goldenFileName);
    return;
  }

  const img1 = PNG.sync.read(fs.readFileSync(testFileName));
  const img2 = PNG.sync.read(fs.readFileSync(goldenFileName));

  expect(img1.width).toEqual(img2.width);
  expect(img1.height).toEqual(img2.height);

  const diff = new PNG({ width: img1.width, height: img2.height });
  const numDiffPixels = pixelmatch(
    img1.data,
    img2.data,
    diff.data,
    img1.width,
    img1.height,
    { threshold: 0.1 },
  );

  if (numDiffPixels > 0) {
    diff.pack().pipe(fs.createWriteStream(diffFileName));
  }

  expect(numDiffPixels).toEqual(0);
}
