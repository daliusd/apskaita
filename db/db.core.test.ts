import { describe, expect, it, beforeEach, afterEach } from 'vitest';

import { mkdtempSync, existsSync, rmdirSync } from 'fs';
import { tmpdir } from 'os';
import * as path from 'path';
import { openDb } from './db';

describe('database tests', () => {
  it('opens and migrates DB', async () => {
    const db = await openDb(':memory:');
    await db.close();
  });

  describe('test in file system', () => {
    const OLD_ENV = process.env;
    let tempDir = '';

    beforeEach(() => {
      process.env = { ...OLD_ENV };
      tempDir = mkdtempSync(path.join(tmpdir(), 'db'));
    });

    afterEach(() => {
      process.env = OLD_ENV;
      rmdirSync(tempDir, { recursive: true });
    });

    it('opens and migrates DB in file system', async () => {
      process.env.USER_DATA_PATH = tempDir;

      const db = await openDb('test');
      await db.close();

      expect(existsSync(path.join(tempDir, 'db', 'test.db'))).toBeTruthy();
    });
  });
});
