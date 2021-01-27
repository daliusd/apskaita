export {};

describe('Simple test', () => {
  beforeAll(async () => {
    await page.goto('http://localhost:4000');
  });

  it('should have "Haiku.lt" somewhere', async () => {
    await page.waitForSelector('text=Haiku.lt');
  });
});
