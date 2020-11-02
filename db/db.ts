import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

export async function openDb(dbName: string) {
  const db = await open({
    filename: dbName,
    driver: sqlite3.cached.Database,
  });
  await db.migrate();

  return db;
}

export async function setSetting(db: Database, name: string, value: string) {
  await db.run(
    `INSERT INTO Setting(name, value) VALUES(?, ?)
    ON CONFLICT(name) DO UPDATE SET value = excluded.value`,
    name,
    value,
  );
}

export async function getSetting(db: Database, name: string) {
  const result = await db.get('SELECT value FROM Setting WHERE name = ?', name);
  return result.value;
}
