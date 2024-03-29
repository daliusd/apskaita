import { describe, expect, it, beforeEach, afterEach } from 'vitest';

import { Database } from 'sqlite';
import { openDb, setSetting, getSetting } from './db';

describe('database tests', () => {
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

    it('if setting is not set', async () => {
      const name = await getSetting(db, 'name');
      expect(name).toBeUndefined();
    });
  });
});
