import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/client';

import { openDb, getUniqueSeriesNames } from '../../../db/db';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });
  if (session) {
    let db;

    try {
      db = await openDb(session.user.email);
      const nameStart =
        typeof req.query.name === 'string' ? req.query.name : req.query.name[0];
      let seriesNames = await getUniqueSeriesNames(db, nameStart);
      if (seriesNames.length === 0) {
        seriesNames = [nameStart];
      }

      return res.json({ seriesNames });
    } catch {
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
