import { NextApiRequest, NextApiResponse } from 'next';

import { getSetting, setSetting } from '../../../db/db';
import { dbWrapper } from '../../../db/apiwrapper';
import { errorHandler } from '../../../utils/report-mailer';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    return dbWrapper(req, res, async (db) => {
      const {
        query: { name },
      } = req;

      const value = await getSetting(
        db,
        typeof name === 'string' ? name : name[0],
      );
      return res.json({ value });
    });
  } else if (req.method === 'PUT') {
    return dbWrapper(req, res, async (db) => {
      const {
        query: { name },
      } = req;

      const nameStr = typeof name === 'string' ? name : name[0];

      if (nameStr.startsWith('__')) {
        return res.json({ success: false });
      }

      await setSetting(db, nameStr, req.body.value);
      return res.json({ success: true });
    });
  }
};

export default errorHandler(handler);
