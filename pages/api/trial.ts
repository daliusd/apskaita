import { NextApiRequest, NextApiResponse } from 'next';

import { getSetting, setSetting } from '../../db/db';
import { dbWrapper } from '../../db/apiwrapper';
import { errorHandler } from '../../utils/report-mailer';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    return dbWrapper(req, res, async (db) => {
      const { code } = req.body;

      if (await getSetting(db, '__plan')) {
        return res.json({ success: false });
      }

      const freeDays = JSON.parse(process.env.NEXT_PUBLIC_PROMO)[code] || 30;

      const d = new Date();
      d.setDate(d.getDate() + freeDays);
      const plan = { endDate: d.toISOString() };

      await setSetting(db, '__plan', JSON.stringify(plan));
      return res.json({ success: true });
    });
  }
};

export default errorHandler(handler);
