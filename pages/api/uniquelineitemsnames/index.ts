import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/client';
import * as Sentry from '@sentry/node';

import { openDb, getUniqueLineItemsNames } from '../../../db/db';
import { init } from '../../../utils/sentry';

init();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });
  if (session) {
    let db;

    try {
      db = await openDb(session.user.email);
      const lineItemsNames = await getUniqueLineItemsNames(db, '');

      return res.json({ lineItemsNames });
    } catch (ex) {
      Sentry.captureException(ex);
      return res.json({ lineItemsNames: [] });
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
