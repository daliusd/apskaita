import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import * as path from 'path';

export interface ILineItem {
  readonly id?: number;
  name: string;
  unit: string;
  amount: number;
  price: number;
}

export interface IInvoice {
  readonly id?: number;
  seriesName: string;
  seriesId: number;
  created: number;
  price: number;
  buyer: string;
  seller: string;
  lineItems: ILineItem[];
}

export async function openDb(dbName: string) {
  const db = await open({
    filename:
      dbName === ':memory:'
        ? dbName
        : path.join(process.env.USER_DATA_PATH, dbName + '.db'),
    driver: sqlite3.Database,
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
  return result && result.value;
}

export async function createInvoice(db: Database, invoice: IInvoice) {
  if (!(await validSeriesNumber(db, invoice.seriesName, invoice.seriesId))) {
    return { success: false };
  }

  const dateValid = await validCreatedDate(
    db,
    invoice.seriesName,
    invoice.seriesId,
    invoice.created,
  );
  if (!dateValid.success) {
    return { success: false };
  }

  const result = await db.run(
    'INSERT INTO Invoice(seriesName, seriesId, created, price, buyer, seller, issuer, extra, flags) VALUES(?, ?, ?, ?, ?, ?, "", "", 0)',
    invoice.seriesName,
    invoice.seriesId,
    invoice.created,
    invoice.price,
    invoice.buyer,
    invoice.seller,
  );

  const invoiceId = result.lastID;

  for (const lineItem of invoice.lineItems) {
    await db.run(
      'INSERT INTO LineItem(invoiceId, name, unit, amount, price) VALUES(?, ?, ?, ?, ?)',
      invoiceId,
      lineItem.name,
      lineItem.unit,
      lineItem.amount,
      lineItem.price,
    );
  }

  return { success: true, invoiceId };
}

export async function getInvoiceList(
  db: Database,
  limit: number,
  offset: number,
) {
  const result = await db.all<IInvoice[]>(
    'SELECT id, seriesName, seriesId, created, price, buyer FROM Invoice ORDER BY created DESC, seriesName, seriesId DESC LIMIT ? OFFSET ?',
    limit,
    offset,
  );
  return result;
}

export async function getInvoiceWithLineItems(db: Database, invoiceId: number) {
  const result = await db.get<IInvoice>(
    'SELECT id, seriesName, seriesId, created, price, buyer, seller FROM Invoice WHERE id = ?',
    invoiceId,
  );

  if (!result) {
    return undefined;
  }

  result.lineItems = await db.all<ILineItem[]>(
    'SELECT id, name, unit, amount, price FROM LineItem WHERE invoiceId = ? ORDER BY id',
    invoiceId,
  );

  return result;
}

export async function getNextSeriesId(db: Database, seriesName: string) {
  const maxSeriesId = (
    await db.get<{ maxSeriesId: number }>(
      'SELECT MAX(seriesId) as maxSeriesId FROM Invoice WHERE seriesName = ?',
      seriesName,
    )
  ).maxSeriesId;

  return maxSeriesId + 1;
}

export async function validSeriesNumber(
  db: Database,
  seriesName: string,
  seriesId: number,
  excludeInvoiceId?: number,
) {
  const countSerie = (
    await db.get(
      'SELECT COUNT(*) as countSerie FROM Invoice WHERE seriesName = ? AND seriesId = ?' +
        (excludeInvoiceId ? ' AND id != ?' : ''),
      seriesName,
      seriesId,
      excludeInvoiceId,
    )
  ).countSerie;

  return countSerie === 0;
}

export async function validCreatedDate(
  db: Database,
  seriesName: string,
  seriesId: number,
  created: number,
  excludeInvoiceId?: number,
) {
  const maxCreated = (
    await db.get(
      'SELECT MAX(created) as maxCreated FROM Invoice WHERE seriesName = ? AND seriesId < ?' +
        (excludeInvoiceId ? ' AND id != ?' : ''),
      seriesName,
      seriesId,
      excludeInvoiceId,
    )
  ).maxCreated;

  if (maxCreated !== null && maxCreated > created) {
    return { success: false, minValidDate: maxCreated };
  }

  const minCreated = (
    await db.get(
      'SELECT MIN(created) as minCreated FROM Invoice WHERE seriesName = ? AND seriesId > ?' +
        (excludeInvoiceId ? ' AND id != ?' : ''),
      seriesName,
      seriesId,
      excludeInvoiceId,
    )
  ).minCreated;

  if (minCreated !== null && minCreated < created) {
    return { success: false, maxValidDate: minCreated };
  }

  return { success: true };
}

export async function updateInvoice(
  db: Database,
  invoiceId: number,
  invoice: IInvoice,
) {
  if (
    !(await validSeriesNumber(
      db,
      invoice.seriesName,
      invoice.seriesId,
      invoiceId,
    ))
  ) {
    return false;
  }

  const dateValid = await validCreatedDate(
    db,
    invoice.seriesName,
    invoice.seriesId,
    invoice.created,
    invoiceId,
  );
  if (!dateValid.success) {
    return false;
  }

  await db.run(
    'UPDATE Invoice SET seriesName = ?, seriesId = ?, created = ?, price = ?, buyer = ?, seller = ? WHERE id = ?',
    invoice.seriesName,
    invoice.seriesId,
    invoice.created,
    invoice.price,
    invoice.buyer,
    invoice.seller,
    invoiceId,
  );

  await db.run('DELETE FROM LineItem WHERE invoiceId = ?', invoiceId);

  for (const lineItem of invoice.lineItems) {
    await db.run(
      'INSERT INTO LineItem(invoiceId, name, unit, amount, price) VALUES(?, ?, ?, ?, ?)',
      invoiceId,
      lineItem.name,
      lineItem.unit,
      lineItem.amount,
      lineItem.price,
    );
  }

  return true;
}

export async function deleteInvoice(db: Database, invoiceId: number) {
  await db.run('DELETE FROM Invoice WHERE id = ?', invoiceId);
  await db.run('DELETE FROM LineItem WHERE invoiceId = ?', invoiceId);

  return true;
}

export async function getUniqueSeriesNames(db: Database, start: string) {
  const result = await db.all(
    'SELECT DISTINCT seriesName FROM Invoice WHERE seriesName LIKE ? ORDER BY seriesName LIMIT 10',
    start + '%',
  );
  return result.map((item) => item.seriesName);
}

export async function getUniqueBuyerNames(db: Database, start: string) {
  const result = await db.all(
    'SELECT DISTINCT buyer FROM Invoice WHERE buyer LIKE ? ORDER BY buyer LIMIT 10',
    '%' + start + '%',
  );
  return result.map((item) => item.buyer);
}

export async function getUniqueLineItemsNames(db: Database, start: string) {
  const result = await db.all(
    'SELECT DISTINCT name FROM LineItem WHERE name LIKE ? ORDER BY name LIMIT 10',
    start + '%',
  );
  return result.map((item) => item.name);
}
