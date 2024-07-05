/* eslint-disable no-console */

import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function info() {
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

  let usersData = [];
  let agreeingUsers = [];
  let usersWithExpenses = [];
  let usersUsingGDriveForInvoices = [];
  let vatPayers = [];

  const dbFilesList = fs.readdirSync(dbDir);
  for (const dbFile of dbFilesList) {
    const dbFileName = path.join(dbDir, dbFile);

    const db = await open({
      filename: dbFileName,
      driver: sqlite3.Database,
    });

    let d = new Date();
    d.setDate(1);
    d.setUTCHours(0, 0, 0, 0);
    d.setMonth(d.getMonth() - 12);

    let query = `
    SELECT strftime('%Y-%m', datetime(created / 1000, 'unixepoch')) as month, sum(price) as total, count(*) as invoices
      FROM Invoice
      WHERE created >= ? and flags = 0
      GROUP BY month
      ORDER BY month`;

    const result = await db.all(query, [d]);

    const invoicesArray = result.map((r) => r.invoices).sort();
    const median = invoicesArray[Math.floor(invoicesArray.length / 2)];

    const contactagreement =
      (
        await db.get(
          'SELECT value FROM Setting WHERE name = "contactagreement"',
        )
      )?.value === '1' || false;

    const lastExpenseDate = (
      await db.get(
        `SELECT strftime('%Y-%m-%d', datetime(created / 1000, 'unixepoch')) as lastExpenseDate
           FROM Expense
           WHERE gdriveId is not null
           ORDER BY created DESC LIMIT 1`,
      )
    )?.lastExpenseDate;

    const totalIncome =
      result.map((r) => r.total).reduce((a, b) => a + b, 0) / 100;
    const averageIncome = totalIncome / result.length;

    const vatpayer =
      (await db.get('SELECT value FROM Setting WHERE name = "vatpayer"'))
        ?.value === '1' || false;

    const usesGDriveForInvoice = (
      await db.get(
        'SELECT count(*) as cnt FROM Invoice WHERE gdriveId is not null',
      )
    )?.cnt;

    const plan = JSON.parse(
      (await db.get('SELECT value FROM Setting WHERE name = "__plan"'))
        ?.value || '{}',
    );
    const planEndDate = plan.endDate
      ? new Date(plan.endDate).toISOString().slice(0, 10)
      : 'xxxx-xx-xx';

    if (result.length > 0) {
      usersData.push({
        dbFile,
        median,
        totalIncome,
        averageIncome,
        lastMonth: result.at(-1).month,
        months: result.length,
        contactagreement,
        vatpayer,
        planEndDate,
      });
    }

    if (contactagreement && result.at(-1)) {
      agreeingUsers.push({ user: dbFile, lastMonth: result.at(-1).month });
    }

    if (usesGDriveForInvoice > 0) {
      usersUsingGDriveForInvoices.push({
        user: dbFile,
        lastMonth: result.at(-1).month,
        cnt: usesGDriveForInvoice,
      });
    }

    if (lastExpenseDate) {
      usersWithExpenses.push({
        user: dbFile,
        lastMonth: result.at(-1).month,
        lastExpenseDate,
      });
    }

    if (vatpayer) {
      vatPayers.push({
        user: dbFile,
        lastMonth: result.at(-1)?.month,
      });
    }

    await db.close();
  }

  usersData.sort((a, b) => a.averageIncome - b.averageIncome);

  const d = new Date();
  const thisMonth = d.toISOString().slice(0, 7);
  d.setMonth(d.getMonth() - 1);
  const prevMonth = d.toISOString().slice(0, 7);

  const potential = usersData
    .filter((u) => u.median >= 5)
    .filter((u) => u.averageIncome >= 1000)
    .filter((u) => u.lastMonth === thisMonth || u.lastMonth === prevMonth);

  for (const user of potential) {
    console.log(user.dbFile);
    console.log('Median:', user.median);
    console.log('Average income:', user.averageIncome);
    console.log('Total Income:', user.totalIncome);
    console.log('Last month:', user.lastMonth);
    console.log('Months as user:', user.months);
    console.log('Contact agreement:', user.contactagreement);
    console.log('VAT payer:', user.vatpayer);
    console.log();
  }

  console.log('Active users:', usersData.length);
  for (const user of usersData) {
    console.log(
      `${user.planEndDate} ${user.lastMonth} ${user.months.toString().padStart(2)} ${user.dbFile}`,
    );
  }

  console.log('\nPotential paying users:', potential.length);

  console.log('\nAgreeing users:');
  for (const u of agreeingUsers) {
    console.log(`${u.user} (${u.lastMonth})`);
  }

  console.log('\nUsers using GDrive for invoices:');
  for (const u of usersUsingGDriveForInvoices) {
    console.log(`${u.user} ${u.cnt} (${u.lastMonth})`);
  }

  console.log('\nUsers with expenses:');
  for (const u of usersWithExpenses) {
    console.log(`${u.user} (${u.lastMonth}) (${u.lastExpenseDate})`);
  }

  console.log('\nVAT payers:');
  for (const u of vatPayers) {
    console.log(`${u.user} (${u.lastMonth})`);
  }
}

info();
