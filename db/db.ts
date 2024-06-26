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
  vat?: number;
  vatcode?: string;
}

export interface IInvoice {
  readonly id?: number;
  invoiceType?: string;
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
  email?: string;
  sent?: number;
  flags?: number;
  alreadyPaid?: number;
  vat?: number;
  gdriveId?: string;
  lineItems: ILineItem[];
}

export interface IExpense {
  readonly id?: number;
  description: string;
  invoiceno: string;
  seller: string;
  items: string;
  created: number;
  price: number;
  gdriveId: string | null;
  webContentLink: string | null;
  webViewLink: string | null;
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
    'INSERT INTO Invoice(seriesName, seriesId, created, price, buyer, seller, issuer, extra, pdfname, language, paid, email, flags, alreadyPaid, vat) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
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
    invoice.email || '',
    invoice.invoiceType === 'proforma'
      ? 1
      : invoice.invoiceType === 'credit'
        ? 2
        : 0,
    invoice.alreadyPaid || 0,
    invoice.vat || 0,
  );

  const invoiceId = result.lastID;

  for (const lineItem of invoice.lineItems) {
    await db.run(
      'INSERT INTO LineItem(invoiceId, name, unit, amount, price, vat, vatcode) VALUES(?, ?, ?, ?, ?, ?, ?)',
      invoiceId,
      lineItem.name,
      lineItem.unit,
      lineItem.amount,
      lineItem.price,
      lineItem.vat || 0,
      lineItem.vatcode || '',
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
  minSeriesNumber?: number;
  maxSeriesNumber?: number;
  invoiceType?: string;
  buyer?: string;
  paid?: number;
}

function formatWhereConditionsForIncoicesQuery(params: GetInvoiceListParams) {
  const args = [];
  const whereConditions = [];

  if (params.minDate !== undefined) {
    whereConditions.push('created >= ?');
    args.push(params.minDate);
  }

  if (params.maxDate !== undefined) {
    whereConditions.push('created <= ?');
    args.push(params.maxDate);
  }

  if (params.invoiceType === 'standard') {
    whereConditions.push('flags = 0');
  } else if (params.invoiceType === 'proforma') {
    whereConditions.push('flags = 1');
  } else if (params.invoiceType === 'credit') {
    whereConditions.push('flags = 2');
  }

  if (params.seriesName !== undefined) {
    whereConditions.push('seriesName LIKE ?');
    args.push(params.seriesName + '%');
  }

  if (params.minSeriesNumber) {
    whereConditions.push('seriesId >= ?');
    args.push(params.minSeriesNumber);
  }

  if (params.maxSeriesNumber) {
    whereConditions.push('seriesId <= ?');
    args.push(params.maxSeriesNumber);
  }

  if (params.buyer !== undefined) {
    whereConditions.push('buyer LIKE ?');
    args.push(params.buyer + '%');
  }

  if (params.paid !== undefined) {
    whereConditions.push('paid = ?');
    args.push(params.paid);
  }

  return {
    args,
    where:
      whereConditions.length > 0
        ? ' WHERE ' + whereConditions.join(' AND ')
        : '',
  };
}

export async function getInvoicesCount(
  db: Database,
  params: GetInvoiceListParams,
) {
  let query = 'SELECT count(*) as cnt FROM Invoice';

  const { args, where } = formatWhereConditionsForIncoicesQuery(params);
  query += where;

  const result = await db.get<{ cnt: number }>(query, ...args);
  return result.cnt;
}

export async function getInvoicesSummary(
  db: Database,
  params: GetInvoiceListParams,
) {
  let query =
    'SELECT flags, paid, sum(price) as price, sum(vat) as vat, count(*) as cnt FROM Invoice';

  const { args, where } = formatWhereConditionsForIncoicesQuery(params);
  query += where;
  query += ' GROUP BY flags, paid';

  const result = await db.all(query, ...args);
  return result;
}

export async function getInvoiceList(
  db: Database,
  params: GetInvoiceListParams,
) {
  const { limit = 10, offset = 0 } = params;

  let query =
    'SELECT id, seriesName, seriesId, created, price, buyer, email, pdfname, paid, locked, sent, flags, vat FROM Invoice';

  const { args, where } = formatWhereConditionsForIncoicesQuery(params);

  query += where;

  query += ' ORDER BY created DESC, seriesName, seriesId DESC LIMIT ? OFFSET ?';

  args.push(limit);
  args.push(offset);

  const result = await db.all<IInvoice[]>(query, ...args);
  result.map((r) =>
    r.flags === 0
      ? (r.invoiceType = 'standard')
      : r.flags === 1
        ? (r.invoiceType = 'proforma')
        : (r.invoiceType = 'credit'),
  );
  return result;
}

export async function getInvoiceWithLineItems(db: Database, invoiceId: number) {
  const result = await db.get<IInvoice>(
    'SELECT id, seriesName, seriesId, created, price, buyer, seller, issuer, extra, pdfname, paid, locked, sent, language, email, flags, alreadyPaid, vat, gdriveId FROM Invoice WHERE id = ?',
    invoiceId,
  );

  if (!result) {
    return undefined;
  }

  result.invoiceType =
    result.flags === 1
      ? 'proforma'
      : result.flags === 2
        ? 'credit'
        : 'standard';
  result.lineItems = await db.all<ILineItem[]>(
    'SELECT id, name, unit, amount, price, vat, vatcode FROM LineItem WHERE invoiceId = ? ORDER BY id',
    invoiceId,
  );

  return result;
}

export async function getLastSellerInformation(
  db: Database,
  seriesName: string,
  language: string,
) {
  let result = await db.get<{ seller: string; issuer: string; extra: string }>(
    'SELECT seller, issuer, extra FROM Invoice WHERE seriesName = ? and language = ? ORDER BY created DESC, seriesId DESC LIMIT 1',
    seriesName,
    language,
  );
  if (result) {
    return result;
  }

  result = await db.get<{ seller: string; issuer: string; extra: string }>(
    'SELECT seller, issuer, extra FROM Invoice WHERE seriesName = ? ORDER BY created DESC, seriesId DESC LIMIT 1',
    seriesName,
  );
  if (result) {
    return result;
  }

  result = await db.get<{ seller: string; issuer: string; extra: string }>(
    'SELECT seller, issuer, extra FROM Invoice WHERE language = ? ORDER BY created DESC, seriesId DESC LIMIT 1',
    language,
  );
  if (result) {
    return result;
  }

  result = await db.get<{ seller: string; issuer: string; extra: string }>(
    'SELECT seller, issuer, extra FROM Invoice ORDER BY created DESC, seriesId DESC LIMIT 1',
  );
  if (result) {
    return result;
  }

  return { seller: '', issuer: '', extra: '' };
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

export async function validSeriesName(
  db: Database,
  seriesName: string,
  invoiceType: string,
  excludeInvoiceId?: number,
) {
  const result = await db.get<{ flags: number }>(
    `SELECT flags FROM Invoice WHERE seriesName = ? ${
      excludeInvoiceId ? ' AND id != ?' : ''
    } ORDER BY id DESC LIMIT 1`,
    seriesName,
    excludeInvoiceId,
  );

  return (
    !result ||
    (invoiceType === 'proforma'
      ? (result.flags & 3) === 1
      : (result.flags & 3) !== 1)
  );
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
    'UPDATE Invoice SET seriesName = ?, seriesId = ?, created = ?, price = ?, buyer = ?, seller = ?, issuer = ?, extra = ?, language = ?, email = ?, flags = ?, alreadyPaid = ?, vat = ? WHERE id = ?',
    invoice.seriesName,
    invoice.seriesId,
    invoice.created,
    invoice.price,
    invoice.buyer,
    invoice.seller,
    invoice.issuer,
    invoice.extra,
    invoice.language,
    invoice.email || '',
    invoice.invoiceType === 'proforma'
      ? 1
      : invoice.invoiceType === 'credit'
        ? 2
        : 0,
    invoice.alreadyPaid || 0,
    invoice.vat || 0,
    invoiceId,
  );

  await db.run('DELETE FROM LineItem WHERE invoiceId = ?', invoiceId);

  for (const lineItem of invoice.lineItems) {
    await db.run(
      'INSERT INTO LineItem(invoiceId, name, unit, amount, price, vat, vatcode) VALUES(?, ?, ?, ?, ?, ?, ?)',
      invoiceId,
      lineItem.name,
      lineItem.unit,
      lineItem.amount,
      lineItem.price,
      lineItem.vat || 0,
      lineItem.vatcode || '',
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

export async function changeInvoiceSentStatus(
  db: Database,
  invoiceId: number,
  sent: boolean,
) {
  await db.run(
    'UPDATE Invoice SET sent = ? WHERE id = ?',
    sent ? 1 : 0,
    invoiceId,
  );
}

export async function changeInvoiceGDriveId(
  db: Database,
  invoiceId: number,
  gdriveId: string,
) {
  await db.run(
    'UPDATE Invoice SET gdriveId = ? WHERE id = ?',
    gdriveId,
    invoiceId,
  );
}

export async function deleteInvoice(db: Database, invoiceId: number) {
  await db.run('DELETE FROM Invoice WHERE id = ?', invoiceId);
  await db.run('DELETE FROM LineItem WHERE invoiceId = ?', invoiceId);

  return true;
}

export async function getUniqueSeriesNames(
  db: Database,
  start: string,
  invoiceType?: string,
) {
  let result;
  if (invoiceType) {
    result = await db.all(
      'SELECT DISTINCT seriesName FROM Invoice WHERE seriesName LIKE ? AND seriesName <> "@" AND flags & 3 = ? ORDER BY seriesName LIMIT 10',
      start + '%',
      invoiceType === 'proforma' ? 1 : 0,
    );
  } else {
    result = await db.all(
      'SELECT DISTINCT seriesName FROM Invoice WHERE seriesName LIKE ? AND seriesName <> "@" ORDER BY seriesName LIMIT 10',
      start + '%',
    );
  }
  return result.map((item) => item.seriesName);
}

export async function getSeriesNameByType(db: Database, invoiceType: string) {
  const result = await db.get<IInvoice>(
    'SELECT seriesName FROM Invoice WHERE flags & 3 = ? ORDER BY created DESC LIMIT 1',
    invoiceType === 'proforma' ? 1 : 0,
  );

  return result?.seriesName || '';
}

export async function getUniqueBuyers(db: Database, start: string) {
  const maxbuyerage = await db.get(
    'SELECT value FROM Setting WHERE name = "maxbuyerage"',
  );
  const maxbuyerageInMonths = parseInt(maxbuyerage?.value || '0', 10);
  let minDate = 0;
  if (maxbuyerageInMonths > 0) {
    const d = new Date();
    d.setMonth(d.getMonth() - maxbuyerageInMonths);
    minDate = +d;
  }

  const result = await db.all(
    `SELECT i1.buyer, (SELECT i2.email FROM Invoice i2 WHERE i2.buyer = i1.buyer ORDER BY i2.id DESC LIMIT 1) as email FROM Invoice i1 WHERE i1.buyer LIKE ? AND i1.created > ? GROUP BY i1.buyer ORDER BY i1.buyer LIMIT 10`,
    '%' + start + '%',
    minDate,
  );
  return result;
}

export async function getUniqueLineItemsNames(db: Database, start: string) {
  const maxitemage = await db.get(
    'SELECT value FROM Setting WHERE name = "maxitemage"',
  );
  const maxItemAgeInMonths = parseInt(maxitemage?.value || '0', 10);
  let minDate = 0;
  if (maxItemAgeInMonths > 0) {
    const d = new Date();
    d.setMonth(d.getMonth() - maxItemAgeInMonths);
    minDate = +d;
  }

  const result = await db.all(
    'SELECT name, MAX(LineItem.price) as price, MAX(LineItem.vat) as vat FROM LineItem JOIN Invoice ON LineItem.invoiceId = Invoice.id WHERE name LIKE ? AND Invoice.created > ? GROUP BY name ORDER BY name LIMIT 10',
    start + '%',
    minDate,
  );
  return result;
}

export async function createExpense(db: Database, expense: IExpense) {
  const result = await db.run(
    'INSERT INTO Expense(description, invoiceno, seller, items, created, price, gdriveId, webViewLink, webContentLink) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)',
    expense.description,
    expense.invoiceno,
    expense.seller,
    expense.items,
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
    'UPDATE Expense SET description = ?, invoiceno = ?, seller = ?, items = ?, created = ?, price = ? WHERE id = ?',
    expense.description,
    expense.invoiceno,
    expense.seller,
    expense.items,
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

export async function getExpense(db: Database, expenseId: number) {
  const result = await db.get<IExpense>(
    'SELECT id, description, invoiceno, seller, items, created, price, gdriveId, webViewLink, webContentLink FROM Expense WHERE id = ?',
    expenseId,
  );

  return result;
}

export async function deleteExpense(db: Database, expenseId: number) {
  await db.run('DELETE FROM Expense WHERE id = ?', expenseId);

  return true;
}

export async function getStats(
  db: Database,
  minDate?: number,
  maxDate?: number,
  seriesName?: string,
) {
  if (!minDate) {
    let d = new Date();
    d.setDate(1);
    d.setUTCHours(0, 0, 0, 0);
    d.setMonth(d.getMonth() - 12);
    minDate = +d;
  }

  const args = [];

  let query =
    "SELECT strftime('%Y-%m', datetime(created / 1000, 'unixepoch')) as month, flags, paid, sum(price) as total, sum(vat) as vat FROM Invoice";

  const whereConditions = [];

  whereConditions.push('created >= ?');
  args.push(minDate);

  if (maxDate) {
    whereConditions.push('created <= ?');
    args.push(maxDate);
  }

  if (seriesName) {
    whereConditions.push('seriesName = ?');
    args.push(seriesName);
  }

  if (whereConditions.length > 0) {
    query += ' WHERE ' + whereConditions.join(' AND ');
  }

  query += ' GROUP BY month, flags, paid ORDER BY month, flags, paid';

  const result = await db.all(query, ...args);
  return result;
}

export async function getExpenseStats(
  db: Database,
  minDate?: number,
  maxDate?: number,
) {
  if (!minDate) {
    let d = new Date();
    d.setDate(1);
    d.setUTCHours(0, 0, 0, 0);
    d.setMonth(d.getMonth() - 12);
    minDate = +d;
  }

  const args = [];

  let query = 'SELECT sum(price) as total FROM Expense';

  const whereConditions = [];

  if (minDate) {
    whereConditions.push('created >= ?');
    args.push(minDate);
  }

  if (maxDate) {
    whereConditions.push('created <= ?');
    args.push(maxDate);
  }

  if (whereConditions.length > 0) {
    query += ' WHERE ' + whereConditions.join(' AND ');
  }

  const result = await db.get(query, ...args);
  return { total: result.total || 0 };
}

export async function getDataForJournal(
  db: Database,
  minDate?: number,
  maxDate?: number,
  seriesName?: string,
  includeExpenses?: boolean,
) {
  if (!minDate) {
    let d = new Date();
    d.setDate(1);
    d.setMonth(0);
    d.setUTCHours(0, 0, 0, 0);
    minDate = +d;
  }

  if (!maxDate) {
    let d = new Date();
    d.setMonth(11);
    d.setDate(31);
    d.setUTCHours(0, 0, 0, 0);
    maxDate = +d;
  }

  let args: (string | number)[] = [minDate, maxDate];
  let query = `
    SELECT
      created, (seriesName || '/' || seriesId) as name, Invoice.price, flags, group_concat(LineItem.name, '\n') as description
      FROM Invoice
      JOIN LineItem ON LineItem.invoiceId = Invoice.id
      WHERE created >= ? AND created <= ? AND flags != 1`;

  if (seriesName) {
    query += ' AND seriesName = ?';
    args.push(seriesName);
  }

  query += ' GROUP BY Invoice.id';

  if (includeExpenses) {
    query += `
    UNION
    SELECT created, '' as name, price, 3 as flags, description FROM Expense
      WHERE created >= ? AND created <= ?`;
    args.push(minDate, maxDate);
  }

  query += ' ORDER BY created';

  const result = await db.all(query, args);
  return result;
}

export async function getInvoicesForIsaf(
  db: Database,
  minDate?: number,
  maxDate?: number,
  seriesName?: string,
) {
  if (!minDate) {
    let d = new Date();
    d.setDate(1);
    d.setMonth(0);
    d.setUTCHours(0, 0, 0, 0);
    minDate = +d;
  }

  if (!maxDate) {
    let d = new Date();
    d.setMonth(11);
    d.setDate(31);
    d.setUTCHours(0, 0, 0, 0);
    maxDate = +d;
  }

  let args: (string | number)[] = [minDate, maxDate];
  let query = `
    SELECT id, created, (seriesName || seriesId) as name, flags, buyer, vat, language
      FROM Invoice
      WHERE created >= ? AND created <= ? AND flags != 1`;

  if (seriesName) {
    query += ' AND seriesName = ?';
    args.push(seriesName);
  }

  query += ' ORDER BY created';

  const result = await db.all(query, args);
  return result;
}

export async function getLineItemsForIsaf(db: Database, invoiceId: number) {
  let query =
    'SELECT vat, vatcode, amount, price FROM LineItem where invoiceId = ?';

  const result = await db.all(query, [invoiceId]);
  return result;
}

export async function getPurchaseInvoices(
  db: Database,
  minDate?: number,
  maxDate?: number,
) {
  if (!minDate) {
    let d = new Date();
    d.setDate(1);
    d.setMonth(0);
    d.setUTCHours(0, 0, 0, 0);
    minDate = +d;
  }

  if (!maxDate) {
    let d = new Date();
    d.setMonth(11);
    d.setDate(31);
    d.setUTCHours(0, 0, 0, 0);
    maxDate = +d;
  }

  let args: (string | number)[] = [minDate, maxDate];
  let query = `
    SELECT id, invoiceno, created, seller, items
      FROM Expense
      WHERE created >= ? AND created <= ?`;

  query += ' ORDER BY created';

  const result = await db.all(query, args);
  return result;
}
