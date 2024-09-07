import { NextApiRequest, NextApiResponse } from 'next';

import { getExpense, updateExpense, deleteExpense } from '../../../db/db';

import { dbWrapper } from '../../../db/apiwrapper';
import { defaultOrFirst } from '../../../utils/query';

import {
  getDrive,
  deleteFile,
  getOrCreateFolder,
  moveFile,
  renameFile,
} from '../../../utils/gdrive';
import { errorHandler } from '../../../utils/report-mailer';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    return dbWrapper(req, res, async (db) => {
      const {
        query: { id },
      } = req;

      const expenseId = parseInt(defaultOrFirst(id), 10);

      const expense = await getExpense(db, expenseId);

      return res.json({ expense });
    });
  } else if (req.method === 'PUT') {
    return dbWrapper(req, res, async (db, session) => {
      const {
        query: { id },
      } = req;

      const expenseId = parseInt(defaultOrFirst(id), 10);

      const success = await updateExpense(db, expenseId, req.body);

      const expenseFromDb = await getExpense(db, expenseId);

      const accessToken = (session as any).accessToken as string;
      if (expenseFromDb.gdriveId && accessToken) {
        const drive = getDrive(accessToken);

        const createdDate = new Date(expenseFromDb.created);
        const year = createdDate.getFullYear().toString();

        const haikuFolderId = await getOrCreateFolder(drive, 'Haiku.lt');
        const expensesFolderId = await getOrCreateFolder(
          drive,
          'Išlaidos',
          haikuFolderId,
        );
        const yearFolderId = await getOrCreateFolder(
          drive,
          year,
          expensesFolderId,
        );

        await renameFile(drive, expenseFromDb.gdriveId, createdDate);
        await moveFile(drive, expenseFromDb.gdriveId, yearFolderId);
      }

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
        const drive = getDrive((session as any).accessToken as string);
        await deleteFile(drive, expense.gdriveId);
      }

      const success = await deleteExpense(db, expenseId);
      return res.json({ success });
    });
  }
};

export default errorHandler(handler);
