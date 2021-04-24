import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs/promises';
import { getSession } from 'next-auth/client';
import { Database } from 'sqlite';
import * as Sentry from '@sentry/node';

import { init } from '../../utils/sentry';
import { getInvoiceList, openDb } from '../../db/db';
import { deleteInvoicePdf } from '../../utils/pdfinvoice';

init();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401);
  }

  const filename = session.user.email + '.db';
  const filenameInFs = path.join(process.env.USER_DATA_PATH, 'db', filename);

  try {
    if (req.method === 'GET') {
      return res
        .writeHead(200, {
          'Content-disposition': 'inline; filename=' + filename,
          'Content-type': 'application/vnd.sqlite3',
        })
        .end(await fs.readFile(filenameInFs));
    } else if (req.method === 'DELETE') {
      let db: Database;
      try {
        db = await openDb(session.user.email);
        const invoices = await getInvoiceList(db, { limit: 10000 });
        for (const invoice of invoices) {
          await deleteInvoicePdf(invoice);
        }
      } finally {
        if (db) {
          await db.close();
        }
      }

      await fs.unlink(filenameInFs);
      return res.status(200).json({ success: true });
    }
  } catch (ex) {
    Sentry.captureException(ex);
    res.status(400).json({ success: false });
  }

  res.end();
};
