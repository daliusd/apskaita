import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/client';

import { openDb, getSetting, setSetting } from '../../../db/db';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });
  if (session) {
    const {
      query: { name },
    } = req;

    if (req.method === 'GET') {
      let db;

      try {
        db = await openDb(session.user.email);

        const value = await getSetting(
          db,
          typeof name === 'string' ? name : name[0],
        );
        return res.json({ value });
      } catch {
        res.status(404);
      } finally {
        if (db) {
          await db.close();
        }
      }
    } else if (req.method === 'PUT') {
      let db;

      try {
        db = await openDb(session.user.email);

        await setSetting(
          db,
          typeof name === 'string' ? name : name[0],
          req.body.value,
        );
        return res.json({ success: true });
      } catch {
        return res.json({ success: false });
      } finally {
        if (db) {
          await db.close();
        }
      }
    }
  } else {
    res.status(401);
  }
  res.end();
};
