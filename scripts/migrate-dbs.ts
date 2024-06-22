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

    // // pro plan for old users
    // // NOTE: 2024-06-22 this is the code that was used to do pro plan migration for old users
    // const result = await db.get('SELECT min(created) as mc FROM Invoice');
    // if (result && result.mc && result.mc < new Date(2024, 5, 22).getTime()) {
    //   try {
    //     await db.run(
    //       `INSERT INTO Setting(name, value) VALUES ('__plan', '{"endDate":"2024-10-01T00:00:00.000Z"}')`,
    //     );
    //   } catch {}
    // }

    await db.close();
  }
}

migrateDbs();
