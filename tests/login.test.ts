import { login } from './login';

describe('Login test', () => {
  beforeAll(async () => {
    await page.goto('http://localhost:4000');
  });

  it('should login', async () => {
    const email = await login(page);

    await page.waitForSelector('text=Esi prisijungęs');
    await page.waitForSelector(`text=${email}`);
  });
});
