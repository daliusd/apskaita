import { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';

import {
  createInvoice,
  getInvoiceList,
  IInvoice,
  getSetting,
  setSetting,
  getLastSellerInformation,
} from '../../../db/db';

import { dbWrapper } from '../../../db/apiwrapper';
import { defaultOrFirst } from '../../../utils/query';
import { errorHandler } from '../../../utils/report-mailer';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    return dbWrapper(req, res, async (db) => {
      const {
        query: {
          limit,
          offset,
          minDate,
          maxDate,
          seriesName,
          buyer,
          paid,
          invoiceType,
        },
      } = req;

      const invoices = await getInvoiceList(db, {
        minDate: minDate && parseInt(defaultOrFirst(minDate), 10),
        maxDate: maxDate && parseInt(defaultOrFirst(maxDate), 10),
        seriesName: seriesName && defaultOrFirst(seriesName),
        invoiceType: invoiceType && defaultOrFirst(invoiceType),
        buyer: buyer && defaultOrFirst(buyer),
        paid: paid && parseInt(defaultOrFirst(paid), 10),
        limit: limit ? parseInt(defaultOrFirst(limit), 10) : 1000,
        offset: offset ? parseInt(defaultOrFirst(offset), 10) : 0,
      });
      return res.json({ invoices });
    });
  } else if (req.method === 'POST') {
    const invoice = req.body.invoice as IInvoice;
    const code = req.body.code as string;

    if (!invoice.seriesId) {
      return res.json({ success: false });
    }

    return dbWrapper(req, res, async (db, session) => {
      const lp = invoice.language === 'lt' ? '' : '_en';

      if (code) {
        const savedCode = await getSetting(db, 'code');
        if (!savedCode) {
          await setSetting(db, 'code', `${code}:${new Date().toISOString()}`);
        }
      }

      const lastSellerInfo = await getLastSellerInformation(
        db,
        invoice.seriesName,
        invoice.language,
      );

      if (!invoice.seller) {
        invoice.seller =
          lastSellerInfo.seller ||
          `${session.user.name}\n${session.user.email}`;
      }

      if (!invoice.issuer) {
        invoice.issuer = lastSellerInfo.issuer || session.user.name;
      }

      invoice.pdfname = `${uuidv4()}.pdf`;

      const createResult = await createInvoice(db, invoice);
      return res.json(createResult);
    });
  }
};

export default errorHandler(handler);
