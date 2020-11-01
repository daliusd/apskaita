import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// you would have to import / invoke this in another file
export async function openDb(dbName: string) {
  const db = await open({
    filename: dbName,
    driver: sqlite3.cached.Database,
  });
  await db.migrate();

  return db;
}
