import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/client';

import { openDb, updateInvoice } from '../../../db/db';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });
  if (session) {
    if (req.method === 'PUT') {
      let db;

      try {
        db = await openDb(session.user.email);

        const {
          query: { id },
        } = req;

        const invoiceId = parseInt(typeof id === 'string' ? id : id[0], 10);

        const success = await updateInvoice(db, invoiceId, req.body);
        return res.json({ success });
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
