import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/client';

import { getNextSeriesId, getUniqueSeriesNames, openDb } from '../../db/db';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });
  if (session) {
    const db = await openDb(session.user.email);
    let seriesNames = await getUniqueSeriesNames(db, '');
    if (seriesNames.length === 0) {
      seriesNames = ['HAIKU'];
    }
    const seriesId = await getNextSeriesId(db, seriesNames[0]);

    await db.close();

    return res.json({ seriesNames, seriesId });
  } else {
    res.status(401);
  }
  res.end();
};
