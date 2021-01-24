import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/client';
import * as Sentry from '@sentry/node';

import { openDb, validSeriesNumber } from '../../../../db/db';
import { init } from '../../../../utils/sentry';

init();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });
  if (session) {
    let db;

    try {
      db = await openDb(session.user.email);

      const {
        query: { name, id, invoiceId },
      } = req;

      const valid = await validSeriesNumber(
        db,
        typeof name === 'string' ? name : name[0],
        parseInt(typeof id === 'string' ? id : id[0], 10),
        invoiceId &&
          parseInt(
            typeof invoiceId === 'string' ? invoiceId : invoiceId[0],
            10,
          ),
      );

      return res.json({ valid });
    } catch (ex) {
      Sentry.captureException(ex);
      return res.json({ valid: true });
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
