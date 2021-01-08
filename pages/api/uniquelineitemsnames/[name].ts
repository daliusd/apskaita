import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/client';

import { openDb, getUniqueLineItemsNames } from '../../../db/db';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });
  if (session) {
    let db;

    try {
      db = await openDb(session.user.email);
      const nameStart =
        typeof req.query.name === 'string' ? req.query.name : req.query.name[0];
      const lineItemsNames = await getUniqueLineItemsNames(db, nameStart);

      return res.json({ lineItemsNames });
    } catch {
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
