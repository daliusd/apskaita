import { NextApiRequest, NextApiResponse } from 'next';

import { init } from '../../../utils/sentry';

init();

import { getInvoiceWithLineItems, getSetting } from '../../../db/db';
import { generateInvoicePdf } from '../../../utils/pdfinvoice';

import { dbWrapper } from '../../../db/apiwrapper';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'PUT') {
    return dbWrapper(req, res, async (db) => {
      const {
        query: { id },
      } = req;

      const invoiceId = parseInt(typeof id === 'string' ? id : id[0], 10);

      const invoice = await getInvoiceWithLineItems(db, invoiceId);
      if (invoice === undefined) {
        return res.status(404).json({ success: false });
      }
      const zeroes = await getSetting(db, 'zeroes');
      const logo = await getSetting(db, 'logo');
      const logo_ratio = parseFloat(await getSetting(db, 'logo_ratio'));
      generateInvoicePdf(invoice, zeroes, logo, logo_ratio);

      return res.json({ success: true });
    });
  }
};
