import { NextApiRequest, NextApiResponse } from 'next';
import sharp from 'sharp';

import { setSetting } from '../../../db/db';

import { dbWrapper } from '../../../db/apiwrapper';

import { uploadPromise } from '../../../utils/upload';

// import { init } from '../../../utils/sentry';

// init();

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  return dbWrapper(req, res, async (db) => {
    const upload = await uploadPromise('logo', req);
    const file = upload.files['logo'][0];

    const image = sharp((file as Express.Multer.File).buffer);
    const meta = await image.metadata();
    const format = meta.format;

    let resized = image.resize({
      width: 284,
      kernel: sharp.kernel.lanczos3,
    });

    if (format !== 'jpeg') {
      resized = resized.toFormat('png');
    }

    const resizedImage = await resized.toBuffer();

    await setSetting(
      db,
      'logo',
      `data:image/${
        format === 'jpeg' ? 'jpeg' : 'png'
      };base64,${resizedImage.toString('base64')}`,
    );

    await setSetting(db, 'logo_ratio', (meta.height / meta.width).toString());

    return res.json({ success: true });
  });
};
