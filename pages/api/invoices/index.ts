import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/client';

import { openDb, createInvoice } from '../../../db/db';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });
  if (session) {
    if (req.method === 'POST') {
      let db;

      try {
        db = await openDb(session.user.email);
        const createResult = await createInvoice(db, req.body);
        return res.json(createResult);
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
