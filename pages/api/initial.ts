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

export default async (req: NextApiRequest, res: NextApiResponse) => {
  return dbWrapper(req, res, async (db, session) => {
    const {
      query: { id },
    } = req;

    if (!id) {
      let seriesNames = await getUniqueSeriesNames(db, '');
      if (seriesNames.length === 0) {
        seriesNames = ['HAIKU'];
      }
      const seriesId = await getNextSeriesId(db, seriesNames[0]);
      const seller =
        (await getSetting(db, 'seller')) ||
        `${session.user.name}\n${session.user.email}`;
      const issuer = (await getSetting(db, 'issuer')) || session.user.name;
      const extra = (await getSetting(db, 'extra')) || '';

      return res.json({
        invoice: {
          seriesName: seriesNames[0],
          seriesId,
          buyer: '',
          seller,
          issuer,
          extra,
          lineItems: [{ id: 0, name: '', unit: 'vnt.', amount: 1, price: 0 }],
        },
      });
    }

    const invoiceId = typeof id === 'string' ? id : id[0];
    const invoice = await getInvoiceWithLineItems(db, parseInt(invoiceId, 10));

    res.json({ invoice });
  });
};
