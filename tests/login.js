const { getDocument, queries } = require('pptr-testing-library');
const chance = require('chance');

const { getByLabelText, getByText } = queries;

async function login(page) {
  await page.goto('http://localhost:4000/api/auth/signin');

  const doc = await getDocument(page);
  const username = await getByLabelText(doc, /username/i);
  const email = chance.email({ domain: 'haiku.lt' });
  await username.type(email);
  const password = await getByLabelText(doc, /password/i);
  await password.type('testpass');

  const signin = await getByText(doc, /Sign in with Credentials/i);
  await signin.click();
  await page.waitForNavigation();

  return email;
}

module.exports = { login };
