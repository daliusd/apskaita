import { NextApiRequest, NextApiResponse } from 'next';

import { init } from '../../../utils/sentry';

init();

import { getExpense, deleteExpense } from '../../../db/db';

import { dbWrapper } from '../../../db/apiwrapper';
import { defaultOrFirst } from '../../../utils/query';

import { getDrive, deleteFile } from '../../../utils/gdrive';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'DELETE') {
    return dbWrapper(req, res, async (db, session) => {
      const {
        query: { id },
      } = req;

      const expenseId = parseInt(defaultOrFirst(id), 10);

      const expense = await getExpense(db, expenseId);
      if (expense && expense.gdriveId) {
        const drive = getDrive(session.accessToken as string);
        await deleteFile(drive, expense.gdriveId);
      }

      const success = await deleteExpense(db, expenseId);
      return res.json({ success });
    });
  }
};
