import { NextApiRequest, NextApiResponse } from 'next';
import { Session, getServerSession } from 'next-auth';
import { Database } from 'sqlite';
import jwt from 'jsonwebtoken';

import { getSetting, openDb } from './db';
import { sendReportMessage } from '../utils/report-mailer';
import { authOptions } from '../pages/api/auth/[...nextauth]';

interface DBCallback {
  (db: Database, session: Session): Promise<void>;
}

export async function dbWrapper(
  req: NextApiRequest,
  res: NextApiResponse,
  callback: DBCallback,
) {
  let session = await getServerSession(req, res, authOptions);

  let currentT;
  if (!session && req.headers.authorization.startsWith('Bearer')) {
    const token = req.headers.authorization.split(' ', 2)[1];
    try {
      const decoded = jwt.verify(token, process.env.SECRET);
      if (typeof decoded !== 'string') {
        session = { user: { email: decoded.user }, expires: '' };
        currentT = decoded.t.toString();
      }
    } catch {
      // NOTE: no success let it be...
    }
  }

  if (session) {
    let db: Database;

    try {
      db = await openDb(session.user.email);

      if (currentT) {
        const t = await getSetting(db, 't');
        if (t !== currentT) {
          res.status(403).json({ message: 'invalid token' });
          return;
        }
      }

      return await callback(db, session);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.log(err); // eslint-disable-line
      }

      await sendReportMessage(
        `haiku.lt server side (${session?.user?.email}) dbWrapper`,
        err,
        req,
      );

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
