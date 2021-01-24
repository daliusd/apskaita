import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/client';
import * as Sentry from '@sentry/node';

import { openDb, getUniqueSeriesNames } from '../../../db/db';
import { init } from '../../../utils/sentry';

init();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });
  if (session) {
    let db;

    try {
      db = await openDb(session.user.email);
      let seriesNames = await getUniqueSeriesNames(db, '');
      if (seriesNames.length === 0) {
        seriesNames = ['HAIKU'];
      }

      return res.json({ seriesNames });
    } catch (ex) {
      Sentry.captureException(ex);
      return res.json({ seriesNames: ['HAIKU'] });
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
