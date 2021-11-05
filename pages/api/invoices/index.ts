import { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';

import {
  createInvoice,
  getInvoiceList,
  IInvoice,
  getSetting,
  setSetting,
} from '../../../db/db';

import { dbWrapper } from '../../../db/apiwrapper';
import { defaultOrFirst } from '../../../utils/query';
import { errorHandler } from '../../../utils/report-mailer';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    return dbWrapper(req, res, async (db) => {
      const {
        query: { limit, offset, minDate, maxDate, seriesName, buyer, paid },
      } = req;

      const invoices = await getInvoiceList(db, {
        minDate: minDate && parseInt(defaultOrFirst(minDate), 10),
        maxDate: maxDate && parseInt(defaultOrFirst(maxDate), 10),
        seriesName: seriesName && defaultOrFirst(seriesName),
        buyer: buyer && defaultOrFirst(buyer),
        paid: paid && parseInt(defaultOrFirst(paid), 10),
        limit: limit ? parseInt(defaultOrFirst(limit), 10) : 1000,
        offset: offset ? parseInt(defaultOrFirst(offset), 10) : 0,
      });
      return res.json({ invoices });
    });
  } else if (req.method === 'POST') {
    const invoice = req.body as IInvoice;

    if (!invoice.seriesId) {
      return res.json({ success: false });
    }

    return dbWrapper(req, res, async (db, session) => {
      const lp = invoice.language === 'lt' ? '' : '_en';

      const savedSeller = await getSetting(db, 'seller' + lp);
      if (!invoice.seller) {
        invoice.seller =
          savedSeller || `${session.user.name}\n${session.user.email}`;
      } else if (!savedSeller) {
        await setSetting(db, 'seller' + lp, invoice.seller);
      }

      const savedIssuer = await getSetting(db, 'issuer' + lp);
      if (!invoice.issuer) {
        invoice.issuer = savedIssuer || session.user.name;
      } else if (!savedIssuer) {
        await setSetting(db, 'issuer' + lp, invoice.issuer);
      }

      const savedExtra = await getSetting(db, 'extra' + lp);
      if (invoice.extra && !savedExtra) {
        await setSetting(db, 'extra' + lp, invoice.extra);
      }

      invoice.pdfname = `${uuidv4()}.pdf`;

      const createResult = await createInvoice(db, invoice);
      return res.json(createResult);
    });
  }
};

export default errorHandler(handler);
