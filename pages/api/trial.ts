import { NextApiRequest, NextApiResponse } from 'next';

import { getSetting, setSetting } from '../../db/db';
import { dbWrapper } from '../../db/apiwrapper';
import { errorHandler } from '../../utils/report-mailer';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    return dbWrapper(req, res, async (db) => {
      if (await getSetting(db, '__plan')) {
        return res.json({ success: false });
      }

      const d = new Date();
      d.setMonth(d.getMonth() + 1);
      const plan = { endDate: d.toISOString() };

      await setSetting(db, '__plan', JSON.stringify(plan));
      return res.json({ success: true });
    });
  }
};

export default errorHandler(handler);
