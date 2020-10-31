export {};

describe('Simple test', () => {
  beforeAll(async () => {
    await page.goto('http://localhost:4000');
  });

  it('should be titled "Haiku.lt"', async () => {
    await expect(page.title()).resolves.toMatch('Haiku.lt');
  });
});
