import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/client';
import { v4 as uuidv4 } from 'uuid';

import {
  openDb,
  createInvoice,
  getInvoiceList,
  IInvoice,
  getSetting,
  setSetting,
} from '../../../db/db';
import { generateInvoicePdf } from '../../../utils/pdfinvoice';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });
  if (session) {
    if (req.method === 'GET') {
      let db;

      try {
        db = await openDb(session.user.email);

        const {
          query: { limit, offset },
        } = req;

        const invoices = await getInvoiceList(
          db,
          limit
            ? parseInt(typeof limit === 'string' ? limit : limit[0], 10)
            : 10,
          offset
            ? parseInt(typeof offset === 'string' ? offset : offset[0], 10)
            : 0,
        );
        return res.json({ invoices });
      } catch {
        return res.json({ invoices: [] });
      } finally {
        if (db) {
          await db.close();
        }
      }
    } else if (req.method === 'POST') {
      let db;

      try {
        const invoice = req.body as IInvoice;

        db = await openDb(session.user.email);

        const savedSeller = await getSetting(db, 'seller');
        if (!invoice.seller) {
          invoice.seller =
            savedSeller || `${session.user.name}\n${session.user.email}`;
        } else if (!savedSeller) {
          await setSetting(db, 'seller', invoice.seller);
        }

        const savedIssuer = await getSetting(db, 'issuer');
        if (!invoice.issuer) {
          invoice.issuer = savedIssuer || session.user.name;
        } else if (!savedIssuer) {
          await setSetting(db, 'issuer', invoice.issuer);
        }

        invoice.pdfname = `${uuidv4()}.pdf`;

        const zeroes = await getSetting(db, 'zeroes');

        const createResult = await createInvoice(db, invoice);
        generateInvoicePdf(invoice, zeroes);

        return res.json(createResult);
      } catch (ex) {
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
