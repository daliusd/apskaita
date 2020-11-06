import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

export interface Good {
  name: string;
  amount: number;
  price: number;
}

export interface Invoice {
  id?: number;
  serieName: string;
  serieId: number;
  created: number;
  price: number;
  buyer: string;
  goods: Good[];
}

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

export async function createInvoice(db: Database, invoice: Invoice) {
  const result = await db.run(
    'INSERT INTO Invoice(serieName, serieId, created, price, buyer) VALUES(?, ?, ?, ?, ?)',
    invoice.serieName,
    invoice.serieId,
    invoice.created,
    invoice.price,
    invoice.buyer,
  );

  const invoiceId = result.lastID;

  for (const good of invoice.goods) {
    await db.run(
      'INSERT INTO Good(invoiceId, name, amount, price) VALUES(?, ?, ?, ?)',
      invoiceId,
      good.name,
      good.amount,
      good.price,
    );
  }

  return invoiceId;
}

export async function getInvoiceList(
  db: Database,
  limit: number,
  offset: number,
) {
  const result = await db.all<Invoice[]>(
    'SELECT id, serieName, serieId, created, price, buyer FROM Invoice ORDER BY created LIMIT ? OFFSET ?',
    limit,
    offset,
  );
  return result;
}

export async function getInvoiceWithGoods(db: Database, invoiceId: number) {
  const result = await db.get<Invoice>(
    'SELECT id, serieName, serieId, created, price, buyer FROM Invoice WHERE id = ?',
    invoiceId,
  );

  result.goods = await db.all<Good[]>(
    'SELECT name, amount, price FROM Good WHERE invoiceId = ? ORDER BY id',
    invoiceId,
  );

  return result;
}

export async function getNextSerieId(db: Database, serieName: string) {
  const maxSerieId = (
    await db.get<{ maxSerieId: number }>(
      'SELECT MAX(serieId) as maxSerieId FROM Invoice WHERE serieName = ?',
      serieName,
    )
  ).maxSerieId;

  return maxSerieId + 1;
}

export async function validSerieNumber(
  db: Database,
  serieName: string,
  serieId: number,
) {
  const countSerie = (
    await db.get(
      'SELECT COUNT(*) as countSerie FROM Invoice WHERE serieName = ? AND serieId = ?',
      serieName,
      serieId,
    )
  ).countSerie;

  return countSerie === 0;
}

export async function validCreatedDate(
  db: Database,
  serieName: string,
  serieId: number,
  created: number,
) {
  const maxCreated = (
    await db.get(
      'SELECT MAX(created) as maxCreated FROM Invoice WHERE serieName = ? AND serieId < ?',
      serieName,
      serieId,
    )
  ).maxCreated;

  if (maxCreated !== null && maxCreated > created) {
    return { success: false, minValidDate: maxCreated };
  }

  const minCreated = (
    await db.get(
      'SELECT MIN(created) as minCreated FROM Invoice WHERE serieName = ? AND serieId > ?',
      serieName,
      serieId,
    )
  ).minCreated;

  if (minCreated !== null && minCreated < created) {
    return { success: false, maxValidDate: minCreated };
  }

  return { success: true };
}
