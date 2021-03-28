import { google } from 'googleapis';
import { NextApiRequest, NextApiResponse } from 'next';
import { uploadPromise } from '../../../utils/upload';

import { createExpense, getExpenseList, IExpense } from '../../../db/db';

import { dbWrapper } from '../../../db/apiwrapper';
import { defaultOrFirst } from '../../../utils/query';

import { init } from '../../../utils/sentry';
import {
  createFile,
  GDriveInfo,
  getOrCreateFolder,
} from '../../../utils/gdrive';

init();

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
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
        const oAuth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_ID,
          process.env.GOOGLE_SECRET,
        );

        oAuth2Client.setCredentials({
          access_token: session.accessToken as string,
        });
        const drive = google.drive({ version: 'v3', auth: oAuth2Client });

        const createdDate = new Date(parseInt(upload.body.created));
        const year = createdDate.getFullYear().toString();

        const haikuFolderId = await getOrCreateFolder(drive, 'Haiku.lt');
        const yearFolderId = await getOrCreateFolder(
          drive,
          year,
          haikuFolderId,
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
