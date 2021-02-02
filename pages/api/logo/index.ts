import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/client';
import * as Sentry from '@sentry/node';
import multer from 'multer';
import sharp from 'sharp';

import { openDb, setSetting } from '../../../db/db';

export const config = {
  api: {
    bodyParser: false,
  },
};

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadPromise = (name, req) => {
  return new Promise((resolve, reject) => {
    upload.single(name)(req, undefined, (err) => {
      if (err) {
        reject();
      } else {
        resolve(req.file);
      }
    });
  });
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });
  if (session) {
    let db;

    try {
      db = await openDb(session.user.email);
      const file = await uploadPromise('logo', req);

      const image = sharp((file as Express.Multer.File).buffer);
      const meta = await image.metadata();
      const format = meta.format;

      let resized = await image.resize({
        width: 284,
        kernel: sharp.kernel.nearest,
      });

      if (format !== 'jpeg') {
        resized = await resized.toFormat('png');
      }

      const resizedImage = await resized.toBuffer();

      await setSetting(
        db,
        'logo',
        `data:image/${
          format === 'jpeg' ? 'jpeg' : 'png'
        };base64,${resizedImage.toString('base64')}`,
      );

      return res.json({ success: true });
    } catch (ex) {
      Sentry.captureException(ex);
      return res.json({ success: false });
    } finally {
      if (db) {
        await db.close();
      }
    }
  } else {
    res.status(401);
  }
};
