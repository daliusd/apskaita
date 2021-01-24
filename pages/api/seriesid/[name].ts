import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/client';
import * as Sentry from '@sentry/node';

import { init } from '../../../utils/sentry';
import { getNextSeriesId, openDb } from '../../../db/db';

init();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });
  if (session) {
    let db;

    try {
      db = await openDb(session.user.email);
      const seriesName =
        typeof req.query.name === 'string' ? req.query.name : req.query.name[0];
      const seriesId = await getNextSeriesId(db, seriesName);

      return res.json({ seriesId });
    } catch (ex) {
      Sentry.captureException(ex);
      return res.json({ seriesId: 1 });
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
