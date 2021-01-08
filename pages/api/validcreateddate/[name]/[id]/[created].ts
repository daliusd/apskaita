import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/client';

import { openDb, validCreatedDate } from '../../../../../db/db';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });
  if (session) {
    let db;

    try {
      db = await openDb(session.user.email);

      const {
        query: { name, id, created, invoiceId },
      } = req;

      const result = await validCreatedDate(
        db,
        typeof name === 'string' ? name : name[0],
        parseInt(typeof id === 'string' ? id : id[0], 10),
        parseInt(typeof created === 'string' ? created : created[0], 10),
        invoiceId &&
          parseInt(
            typeof invoiceId === 'string' ? invoiceId : invoiceId[0],
            10,
          ),
      );

      return res.json(result);
    } catch {
      return res.json({ success: true });
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
