import { NextApiRequest, NextApiResponse } from 'next';
import jimp from 'jimp';

import { setSetting } from '../../../db/db';

import { dbWrapper } from '../../../db/apiwrapper';

import { uploadPromise } from '../../../utils/upload';
import { errorHandler } from '../../../utils/report-mailer';

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  return dbWrapper(req, res, async (db) => {
    const upload = await uploadPromise('logo', req);
    const file = upload.files['logo'][0];

    const image = await jimp.read((file as Express.Multer.File).buffer);

    image.resize(284, jimp.AUTO);

    const resizedImage = await image.getBase64Async(jimp.MIME_PNG);

    await setSetting(db, 'logo', resizedImage);

    await setSetting(
      db,
      'logo_ratio',
      (image.getHeight() / image.getWidth()).toString(),
    );

    return res.json({ success: true });
  });
};

export default errorHandler(handler);
