import { NextApiRequest, NextApiResponse } from 'next';

import { init } from '../../utils/sentry';

init();

import {
  getNextSeriesId,
  getUniqueSeriesNames,
  getInvoiceWithLineItems,
  getSetting,
} from '../../db/db';

import { dbWrapper } from '../../db/apiwrapper';
import { defaultOrFirst } from '../../utils/query';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  return dbWrapper(req, res, async (db, session) => {
    const {
      query: { id, sourceId },
    } = req;

    if (!id && !sourceId) {
      const seriesNames = await getUniqueSeriesNames(db, '');
      const seriesId = await getNextSeriesId(db, seriesNames[0] || '');
      const seller =
        (await getSetting(db, 'seller')) ||
        `${session.user.name}\n${session.user.email}`;
      const issuer = (await getSetting(db, 'issuer')) || session.user.name;
      const extra = (await getSetting(db, 'extra')) || '';

      return res.json({
        invoice: {
          seriesName: seriesNames[0] || '',
          seriesId,
          buyer: '',
          seller,
          issuer,
          extra,
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

      const lp = invoice.language === 'lt' ? '' : '_en';
      const seller = (await getSetting(db, 'seller' + lp)) || invoice.seller;
      const issuer = (await getSetting(db, 'issuer' + lp)) || invoice.issuer;
      const extra = (await getSetting(db, 'extra' + lp)) || invoice.extra;

      return res.json({
        invoice: {
          ...invoice,
          seriesId,
          created: undefined,
          pdfname: '',
          paid: 0,
          locked: 0,
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
