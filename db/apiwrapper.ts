import { NextApiRequest, NextApiResponse } from 'next';
import { getSession, Session } from 'next-auth/client';
import * as Sentry from '@sentry/node';
import { Database } from 'sqlite';

import { openDb } from './db';

interface DBCallback {
  (db: Database, session: Session): Promise<void>;
}

export async function dbWrapper(
  req: NextApiRequest,
  res: NextApiResponse,
  callback: DBCallback,
) {
  const session = await getSession({ req });
  if (session) {
    let db: Database;

    try {
      db = await openDb(session.user.email);

      return await callback(db, session);
    } catch (err) {
      Sentry.setUser({ email: session.user.email });
      Sentry.captureException(err);
      res.status(500).json({ success: false });
      return;
    } finally {
      if (db) {
        await db.close();
      }
    }
  } else {
    res.status(401);
  }
  res.end();
}
