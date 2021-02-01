import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/client';
import * as Sentry from '@sentry/node';

import { init } from '../../../utils/sentry';

init();

import {
  openDb,
  updateInvoice,
  deleteInvoice,
  getInvoiceWithLineItems,
  getSetting,
} from '../../../db/db';
import {
  deleteInvoicePdf,
  generateInvoicePdf,
} from '../../../utils/pdfinvoice';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });
  if (session) {
    if (req.method === 'PUT') {
      let db;

      try {
        db = await openDb(session.user.email);

        const {
          query: { id },
        } = req;

        const invoiceId = parseInt(typeof id === 'string' ? id : id[0], 10);

        const success = await updateInvoice(db, invoiceId, req.body);

        if (success) {
          const invoice = await getInvoiceWithLineItems(db, invoiceId);
          const zeroes = await getSetting(db, 'zeroes');
          const logo = await getSetting(db, 'logo');
          generateInvoicePdf(invoice, zeroes, logo);
        }

        return res.json({ success });
      } catch (ex) {
        Sentry.captureException(ex);
        return res.json({ success: false });
      } finally {
        if (db) {
          await db.close();
        }
      }
    } else if (req.method === 'DELETE') {
      let db;

      try {
        db = await openDb(session.user.email);

        const {
          query: { id },
        } = req;

        const invoiceId = parseInt(typeof id === 'string' ? id : id[0], 10);

        const invoice = await getInvoiceWithLineItems(db, invoiceId);
        if (invoice) {
          deleteInvoicePdf(invoice);
        }

        const success = await deleteInvoice(db, invoiceId);
        return res.json({ success });
      } catch (ex) {
        Sentry.captureException(ex);
        return res.json({ success: false });
      } finally {
        if (db) {
          await db.close();
        }
      }
    }
  } else {
    res.status(401);
  }
  res.end();
};
