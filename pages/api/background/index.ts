import { NextApiRequest, NextApiResponse } from 'next';
import sharp from 'sharp';

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
    const upload = await uploadPromise('background', req);
    const file = upload.files['background'][0];

    let image = sharp((file as Express.Multer.File).buffer);
    const meta = await image.metadata();
    const format = meta.format;

    if (format !== 'jpeg') {
      image = image.toFormat('png');
    }

    const imageBuffer = await image.toBuffer();
    if (imageBuffer.length > 75 * 1024) {
      return res.json({ success: false });
    }

    const encoded = imageBuffer.toString('base64');

    await setSetting(
      db,
      'background',
      `data:image/${format === 'jpeg' ? 'jpeg' : 'png'};base64,${encoded}`,
    );

    return res.json({ success: true });
  });
};

export default errorHandler(handler);
