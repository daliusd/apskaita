import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs';

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
  issuer: string;
  extra: string;
  language: string;
  pdfname?: string;
  paid?: number;
  locked?: number;
  lineItems: ILineItem[];
}

export interface IExpense {
  readonly id?: number;
  description: string;
  created: number;
  price: number;
  gdriveId: string;
  webContentLink: string;
  webViewLink: string;
}

export async function openDb(dbName: string) {
  const isMemory = dbName === ':memory:';
  let dbDir = '';
  if (!isMemory) {
    dbDir = path.join(process.env.USER_DATA_PATH, 'db');

    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
  }

  const dbFileName = path.join(dbDir, dbName + '.db');
  const needsMigration = isMemory || !fs.existsSync(dbFileName);

  const db = await open({
    filename: isMemory ? dbName : dbFileName,
    driver: sqlite3.Database,
  });

  if (needsMigration) {
    await db.migrate();
  }

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
    'INSERT INTO Invoice(seriesName, seriesId, created, price, buyer, seller, issuer, extra, pdfname, language, paid, flags) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)',
    invoice.seriesName,
    invoice.seriesId,
    invoice.created,
    invoice.price,
    invoice.buyer,
    invoice.seller,
    invoice.issuer,
    invoice.extra,
    invoice.pdfname,
    invoice.language,
    invoice.paid || 0,
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

interface GetInvoiceListParams {
  limit?: number;
  offset?: number;
  minDate?: number;
  maxDate?: number;
  seriesName?: string;
  buyer?: string;
  paid?: number;
}

export async function getInvoiceList(
  db: Database,
  params: GetInvoiceListParams,
) {
  const { limit = 10, offset = 0 } = params;
  const args = [];

  let query =
    'SELECT id, seriesName, seriesId, created, price, buyer, pdfname, paid, locked FROM Invoice';

  const whereConditions = [];

  if (params.minDate !== undefined) {
    whereConditions.push('created >= ?');
    args.push(params.minDate);
  }

  if (params.maxDate !== undefined) {
    whereConditions.push('created <= ?');
    args.push(params.maxDate);
  }

  if (params.seriesName !== undefined) {
    whereConditions.push('seriesName LIKE ?');
    args.push(params.seriesName + '%');
  }

  if (params.buyer !== undefined) {
    whereConditions.push('buyer LIKE ?');
    args.push(params.buyer + '%');
  }

  if (params.paid !== undefined) {
    whereConditions.push('paid = ?');
    args.push(params.paid);
  }

  if (whereConditions.length > 0) {
    query += ' WHERE ' + whereConditions.join(' AND ');
  }

  query += ' ORDER BY created DESC, seriesName, seriesId DESC LIMIT ? OFFSET ?';

  args.push(limit);
  args.push(offset);

  const result = await db.all<IInvoice[]>(query, ...args);
  return result;
}

export async function getInvoiceWithLineItems(db: Database, invoiceId: number) {
  const result = await db.get<IInvoice>(
    'SELECT id, seriesName, seriesId, created, price, buyer, seller, issuer, extra, pdfname, paid, locked, language FROM Invoice WHERE id = ?',
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
    'UPDATE Invoice SET seriesName = ?, seriesId = ?, created = ?, price = ?, buyer = ?, seller = ?, issuer = ?, extra = ?, language = ? WHERE id = ?',
    invoice.seriesName,
    invoice.seriesId,
    invoice.created,
    invoice.price,
    invoice.buyer,
    invoice.seller,
    invoice.issuer,
    invoice.extra,
    invoice.language,
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

export async function changeInvoicePaidStatus(
  db: Database,
  invoiceId: number,
  paid: boolean,
) {
  await db.run(
    'UPDATE Invoice SET paid = ? WHERE id = ?',
    paid ? 1 : 0,
    invoiceId,
  );
}

export async function changeInvoiceLockedStatus(
  db: Database,
  invoiceId: number,
  locked: boolean,
) {
  await db.run(
    'UPDATE Invoice SET locked = ? WHERE id = ?',
    locked ? 1 : 0,
    invoiceId,
  );
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
    'SELECT name, MAX(price) as price FROM LineItem WHERE name LIKE ? GROUP BY name ORDER BY name LIMIT 10',
    start + '%',
  );
  return result;
}

export async function createExpense(db: Database, expense: IExpense) {
  const result = await db.run(
    'INSERT INTO Expense(description, created, price, gdriveId, webViewLink, webContentLink) VALUES(?, ?, ?, ?, ?, ?)',
    expense.description,
    expense.created,
    expense.price,
    expense.gdriveId,
    expense.webViewLink,
    expense.webContentLink,
  );

  const expenseId = result.lastID;

  return { success: true, expenseId };
}

export async function updateExpense(
  db: Database,
  expenseId: number,
  expense: IExpense,
) {
  await db.run(
    'UPDATE Expense SET description = ?, created = ?, price = ? WHERE id = ?',
    expense.description,
    expense.created,
    expense.price,
    expenseId,
  );

  return true;
}

interface GetExpenseListParams {
  limit?: number;
  offset?: number;
  description?: string;
  minDate?: number;
  maxDate?: number;
}

export async function getExpenseList(
  db: Database,
  params: GetExpenseListParams,
) {
  const { limit = 10, offset = 0 } = params;
  const args = [];

  let query =
    'SELECT id, description, created, price, gdriveId, webViewLink, webContentLink FROM Expense';

  const whereConditions = [];

  if (params.description !== undefined) {
    whereConditions.push('description LIKE ?');
    args.push('%' + params.description + '%');
  }

  if (params.minDate !== undefined) {
    whereConditions.push('created >= ?');
    args.push(params.minDate);
  }

  if (params.maxDate !== undefined) {
    whereConditions.push('created <= ?');
    args.push(params.maxDate);
  }

  if (whereConditions.length > 0) {
    query += ' WHERE ' + whereConditions.join(' AND ');
  }

  query += ' ORDER BY created DESC LIMIT ? OFFSET ?';

  args.push(limit);
  args.push(offset);

  const result = await db.all<IExpense[]>(query, ...args);
  return result;
}

export async function deleteExpense(db: Database, expenseId: number) {
  await db.run('DELETE FROM Expense WHERE id = ?', expenseId);

  return true;
}
