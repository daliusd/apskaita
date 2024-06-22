import { NextApiRequest, NextApiResponse } from 'next';

import {
  getNextSeriesId,
  getUniqueSeriesNames,
  getInvoiceWithLineItems,
  getLastSellerInformation,
} from '../../db/db';

import { dbWrapper } from '../../db/apiwrapper';
import { defaultOrFirst } from '../../utils/query';
import { errorHandler } from '../../utils/report-mailer';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  return dbWrapper(req, res, async (db, session) => {
    const {
      query: { id, sourceId, invoiceType },
    } = req;

    if (!id && !sourceId) {
      const seriesNames = await getUniqueSeriesNames(
        db,
        '',
        defaultOrFirst(invoiceType),
      );
      const seriesId = await getNextSeriesId(db, seriesNames[0] || '');
      const lastSellerInfo = await getLastSellerInformation(
        db,
        seriesNames[0],
        'lt',
      );

      const seller =
        lastSellerInfo.seller || `${session.user.name}\n${session.user.email}`;
      const issuer = lastSellerInfo.issuer || session.user.name;
      const extra = lastSellerInfo.extra || '';

      return res.json({
        invoice: {
          seriesName: seriesNames[0] || '',
          seriesId,
          buyer: '',
          seller,
          issuer,
          extra,
          email: '',
          language: 'lt',
          lineItems: [{ id: 0, name: '', unit: 'vnt.', amount: 1, price: 0 }],
        },
      });
    } else if (sourceId) {
      const invoice = await getInvoiceWithLineItems(
        db,
        parseInt(defaultOrFirst(sourceId), 10),
      );

      const seriesId = await getNextSeriesId(db, invoice.seriesName);

      const lastSellerInfo = await getLastSellerInformation(
        db,
        invoice.seriesName,
        invoice.language,
      );
      const seller = lastSellerInfo.seller || invoice.seller;
      const issuer = lastSellerInfo.issuer || invoice.issuer;
      const extra = lastSellerInfo.extra || invoice.extra;

      return res.json({
        invoice: {
          ...invoice,
          id: undefined,
          seriesId,
          created: undefined,
          pdfname: '',
          paid: 0,
          locked: 0,
          sent: 0,
          seller,
          issuer,
          extra,
        },
      });
    }

    const invoiceId = defaultOrFirst(id);
    const invoice = await getInvoiceWithLineItems(db, parseInt(invoiceId, 10));

    res.json({ invoice });
  });
};

export default errorHandler(handler);
