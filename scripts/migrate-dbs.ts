/* eslint-disable no-console */

import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function migrateDbs() {
  const env = fs.readFileSync('./.env.local', { encoding: 'utf8' });
  const vars: Record<string, string> = {};
  env
    .split('\n')
    .map((l) => l.split('='))
    .forEach((i) => (vars[i[0]] = i[1]));

  if (!('USER_DATA_PATH' in vars)) {
    console.log('USER_DATA_PATH is missing');
    process.exitCode = 1;
    return;
  }

  const dbDir = path.join(vars.USER_DATA_PATH, 'db');

  const dbFilesList = fs.readdirSync(dbDir);
  for (const dbFile of dbFilesList) {
    console.log(`Processing ${dbFile}`);
    const dbFileName = path.join(dbDir, dbFile);

    const db = await open({
      filename: dbFileName,
      driver: sqlite3.Database,
    });

    await db.migrate();
    await db.close();
  }
}

migrateDbs();
