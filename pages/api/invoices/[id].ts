import { NextApiRequest, NextApiResponse } from 'next';

import { init } from '../../../utils/sentry';

init();

import {
  updateInvoice,
  deleteInvoice,
  getInvoiceWithLineItems,
} from '../../../db/db';
import { defaultOrFirst } from '../../../utils/query';
import { deleteInvoicePdf } from '../../../utils/pdfinvoice';

import { dbWrapper } from '../../../db/apiwrapper';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'PUT') {
    return dbWrapper(req, res, async (db) => {
      const {
        query: { id },
      } = req;

      const invoiceId = parseInt(defaultOrFirst(id), 10);

      const success = await updateInvoice(db, invoiceId, req.body);

      return res.json({ success });
    });
  } else if (req.method === 'DELETE') {
    return dbWrapper(req, res, async (db) => {
      const {
        query: { id },
      } = req;

      const invoiceId = parseInt(defaultOrFirst(id), 10);

      const invoice = await getInvoiceWithLineItems(db, invoiceId);
      if (invoice) {
        deleteInvoicePdf(invoice);
      }

      const success = await deleteInvoice(db, invoiceId);
      return res.json({ success });
    });
  }
};
