import { deleteUser, login } from './login';

describe('Login test', () => {
  beforeAll(async () => {
    await page.goto('http://localhost:3000');
  });

  afterAll(async () => {
    await deleteUser(page);
  });

  it('should login', async () => {
    const email = await login(page);

    await page.waitForSelector('text=Esi prisijungęs');
    await page.waitForSelector(`text=${email}`);
  });
});
