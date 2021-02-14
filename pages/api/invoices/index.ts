import { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';

import { init } from '../../../utils/sentry';

init();

import {
  createInvoice,
  getInvoiceList,
  IInvoice,
  getSetting,
  setSetting,
} from '../../../db/db';

import { dbWrapper } from '../../../db/apiwrapper';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    return dbWrapper(req, res, async (db) => {
      const {
        query: { limit, offset },
      } = req;

      const invoices = await getInvoiceList(
        db,
        limit
          ? parseInt(typeof limit === 'string' ? limit : limit[0], 10)
          : 1000,
        offset
          ? parseInt(typeof offset === 'string' ? offset : offset[0], 10)
          : 0,
      );
      return res.json({ invoices });
    });
  } else if (req.method === 'POST') {
    const invoice = req.body as IInvoice;

    if (!invoice.seriesId) {
      return res.json({ success: false });
    }

    return dbWrapper(req, res, async (db, session) => {
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

      const createResult = await createInvoice(db, invoice);
      return res.json(createResult);
    });
  }
};
