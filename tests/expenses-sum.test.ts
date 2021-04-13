import { login } from './login';

describe('Settings test', () => {
  beforeAll(async () => {
    await page.goto('http://localhost:3000');
  });

  it('should create invoice', async () => {
    await login(page);

    await page.goto('http://localhost:3000/');

    await Promise.all([
      page.waitForNavigation(/*{ url: 'http://localhost:3000/islaidos' }*/),
      page.click('text=Išlaidos'),
    ]);

    await page.click('button:has-text("Pridėti išlaidų įrašą")');
    await page.fill('[aria-label="Išlaidų aprašymas"]', 'pirmas');
    await page.fill('input[type="number"]', '0.01');
    await page.click('[aria-label="Pridėti išlaidų įrašą"]');

    await page.click('button:has-text("Pridėti išlaidų įrašą")');
    await page.fill('[aria-label="Išlaidų aprašymas"]', 'antras');
    await page.fill('input[type="number"]', '0.02');
    await page.click('[aria-label="Pridėti išlaidų įrašą"]');

    await page.click(
      'text=Rasta išlaidų įrašų pagal filtrus: 2. Šių išlaidų įrašų bendra suma 0.03 €.',
    );
  });
});
