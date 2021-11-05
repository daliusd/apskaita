import { NextApiRequest, NextApiResponse } from 'next';

import { getExpense, updateExpense, deleteExpense } from '../../../db/db';

import { dbWrapper } from '../../../db/apiwrapper';
import { defaultOrFirst } from '../../../utils/query';

import { getDrive, deleteFile } from '../../../utils/gdrive';
import { errorHandler } from '../../../utils/report-mailer';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'PUT') {
    return dbWrapper(req, res, async (db) => {
      const {
        query: { id },
      } = req;

      const expenseId = parseInt(defaultOrFirst(id), 10);

      const success = await updateExpense(db, expenseId, req.body);

      return res.json({ success });
    });
  } else if (req.method === 'DELETE') {
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

export default errorHandler(handler);
