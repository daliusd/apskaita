import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';
import { getSession } from 'next-auth/client';
import * as Sentry from '@sentry/node';

import { init } from '../../utils/sentry';

init();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401);
  }

  if (req.method === 'GET') {
    try {
      const filename = session.user.email + '.db';

      return res
        .writeHead(200, {
          'Content-disposition': 'inline; filename=' + filename,
          'Content-type': 'application/vnd.sqlite3',
        })
        .end(
          fs.readFileSync(
            path.join(process.env.USER_DATA_PATH, 'db', filename),
          ),
        );
    } catch (ex) {
      Sentry.captureException(ex);
      res.status(400).json({ success: false });
    }
  }

  res.end();
};
