import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';

import { errorHandler } from '../../utils/report-mailer';
import { authOptions } from './auth/[...nextauth]';
import { getSetting, openDb, setSetting } from '../../db/db';
import { Database } from 'sqlite3';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user.email !== process.env.ADMIN_USER) {
    res.status(401);
    return;
  }

  if (req.method === 'POST') {
    let db: Database;

    try {
      const db = await openDb(req.body.user);
      const planJson = await getSetting(db, '__plan');

      let startDate = new Date();
      if (planJson) {
        const plan = JSON.parse(planJson);
        const endDate = plan.endDate ? new Date(plan.endDate) : startDate;
        if (endDate.getTime() > startDate.getTime()) {
          startDate = endDate;
        }
      }

      startDate.setMonth(startDate.getMonth() + req.body.months);
      const newPlan = { endDate: startDate.toISOString() };

      await setSetting(db, '__plan', JSON.stringify(newPlan));
      return res.json({ success: true, endDate: startDate });
    } finally {
      if (db) {
        db.close();
      }
    }
  }
};

export default errorHandler(handler);
