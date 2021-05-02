import { deleteUser, login } from './login';

describe('Settings test', () => {
  beforeAll(async () => {
    await page.goto('http://localhost:3000');
  });

  afterAll(async () => {
    await deleteUser(page);
  });

  it('should create invoice', async () => {
    await login(page);

    await page.goto('http://localhost:3000/');

    await Promise.all([
      page.waitForNavigation(/*{ url: 'http://localhost:3000/islaidos' }*/),
      page.click('text=Išlaidos'),
    ]);

    await page.click('button:has-text("Pridėti išlaidų įrašą")');

    await page.fill('[aria-label="Išlaidų aprašymas"]', 'Test');

    await page.fill('input[type="number"]', '10');
    await page.click('[aria-label="Pridėti išlaidų įrašą"]');

    await page.waitForSelector('text=Išlaidos įrašas pridėtas.');

    await page.waitForSelector(
      'text=Rasta išlaidų įrašų pagal filtrus: 1. Šių išlaidų įrašų bendra suma 10 €.',
    );

    await page.click('[aria-label="Ištrinti išlaidų įrašą"]');

    await page.waitForSelector('text=Išlaidų įrašas ištrintas.');
    await page.waitForSelector(
      'text=Nerasta išlaidų įrašų pagal šiuos filtrus.',
    );
  });
});
