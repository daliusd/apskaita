import { NextApiRequest, NextApiResponse } from 'next';
import { uploadPromise } from '../../../utils/upload';

import { createExpense, getExpenseList, IExpense } from '../../../db/db';

import { dbWrapper } from '../../../db/apiwrapper';
import { defaultOrFirst } from '../../../utils/query';

import {
  createFile,
  GDriveInfo,
  getDrive,
  getOrCreateFolder,
} from '../../../utils/gdrive';
import { errorHandler } from '../../../utils/report-mailer';

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    return dbWrapper(req, res, async (db) => {
      const {
        query: { limit, offset, minDate, maxDate, description },
      } = req;

      const expenses = await getExpenseList(db, {
        minDate: minDate && parseInt(defaultOrFirst(minDate), 10),
        maxDate: maxDate && parseInt(defaultOrFirst(maxDate), 10),
        description: description && defaultOrFirst(description),
        limit: limit ? parseInt(defaultOrFirst(limit), 10) : 1000,
        offset: offset ? parseInt(defaultOrFirst(offset), 10) : 0,
      });
      return res.json({ expenses });
    });
  } else if (req.method === 'POST') {
    return dbWrapper(req, res, async (db, session) => {
      const upload = await uploadPromise('file', req);

      let gdriveInfo: GDriveInfo = {
        id: null,
        webViewLink: null,
        webContentLink: null,
      };

      if (upload.files['file']) {
        const drive = getDrive((session as any).accessToken as string);

        const createdDate = new Date(parseInt(upload.body.created));
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

        gdriveInfo = await createFile(
          drive,
          upload.files['file'][0],
          createdDate,
          upload.body.description,
          yearFolderId,
        );
      }

      const expense: IExpense = {
        description: upload.body.description,
        invoiceno: upload.body.invoiceno,
        seller: upload.body.seller,
        items: upload.body.items,
        created: parseInt(upload.body.created),
        price: parseFloat(upload.body.price),
        gdriveId: gdriveInfo.id,
        webContentLink: gdriveInfo.webContentLink,
        webViewLink: gdriveInfo.webViewLink,
      };
      const createResult = await createExpense(db, expense);
      return res.json(createResult);
    });
  }
};

export default errorHandler(handler);
