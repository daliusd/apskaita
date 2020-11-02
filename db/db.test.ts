import { Database } from 'sqlite';
import { openDb, setSetting, getSetting } from './db';

describe('database tests', () => {
  it('opens and migrates DB', async () => {
    const db = await openDb(':memory:');
    await db.close();
  });

  describe('handles settings properly', () => {
    let db: Database;

    beforeEach(async () => {
      db = await openDb(':memory:');
    });

    afterEach(async () => {
      await db.close();
    });

    it('sets and gets setting', async () => {
      await setSetting(db, 'name', 'test');
      const name = await getSetting(db, 'name');
      expect(name).toEqual('test');
    });

    it('overwrites setting', async () => {
      await setSetting(db, 'name', 'test');
      await setSetting(db, 'name', 'test2');
      const name = await getSetting(db, 'name');
      expect(name).toEqual('test2');
    });
  });
});
