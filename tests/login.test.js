const { getDocument, queries } = require('pptr-testing-library');

const { queryByText } = queries;

const { login } = require('./login');

describe('Login test', () => {
  beforeAll(async () => {
    await page.goto('http://localhost:4000');
  });

  it('should login and "', async () => {
    const email = await login(page);

    const doc = await getDocument(page);
    expect((await queryByText(doc, new RegExp(email))) === null).toBeFalsy();
  });
});
