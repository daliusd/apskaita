import { openDb } from './db';

describe('database tests', () => {
  it('opens and migrates DB', async () => {
    await openDb(':memory:');
  });
});
