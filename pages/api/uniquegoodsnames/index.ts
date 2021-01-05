import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/client';

import { openDb, getUniqueGoodsNames } from '../../../db/db';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });
  if (session) {
    let db;

    try {
      db = await openDb(session.user.email);
      const goodsNames = await getUniqueGoodsNames(db, '');

      return res.json({ goodsNames });
    } catch {
      return res.json({ goodsNames: [] });
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
