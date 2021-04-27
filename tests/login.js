const { Chance } = require('chance');

const chance = Chance();

async function login(page) {
  await page.goto('http://localhost:3000/api/auth/signin');

  const email = chance.email({ domain: 'haiku.lt' });
  await page.click('input[name="username"]');
  await page.fill('input[name="username"]', email);

  await page.click('input[name="password"]');
  await page.fill('input[name="password"]', 'testpass');

  await page.click('text="Sign in with Credentials"');

  await page.waitForNavigation({ url: 'http://localhost:3000/' });

  return email;
}

async function deleteUser(page) {
  await page.evaluate(() => {
    return fetch('/api/userdata', {
      method: 'DELETE',
    });
  });
}

module.exports = {
  login,
  deleteUser,
};
