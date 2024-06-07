import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

import { setSetting } from '../../db/db';

import { dbWrapper } from '../../db/apiwrapper';
import { errorHandler } from '../../utils/report-mailer';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    return dbWrapper(req, res, async (db, session) => {
      const t = +new Date();

      await setSetting(db, 't', t.toString());

      const token = jwt.sign(
        { user: session.user.email, t },
        process.env.SECRET,
        { noTimestamp: true },
      );

      res.json({ success: true, token });
    });
  }
};

export default errorHandler(handler);
