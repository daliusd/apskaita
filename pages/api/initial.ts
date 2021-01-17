import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/client';

import {
  getNextSeriesId,
  getUniqueSeriesNames,
  openDb,
  getInvoiceWithLineItems,
  getSetting,
} from '../../db/db';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });
  if (session) {
    let db;

    try {
      db = await openDb(session.user.email);

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
      const invoice = await getInvoiceWithLineItems(
        db,
        parseInt(invoiceId, 10),
      );

      return res.json({ invoice });
    } catch {
      return res.json({ invoice: undefined });
    } finally {
      if (db) {
        await db.close();
      }
    }
  } else {
    res.status(401);
  }
  res.end();
};
