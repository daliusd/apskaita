import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';
// import * as Sentry from '@sentry/node';

// import { init } from '../../../../utils/sentry';

// init();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    try {
      const {
        query: { id, name },
      } = req;

      const fileName = typeof id === 'string' ? id : id[0];
      const downloadName = typeof name === 'string' ? name : name[0];

      res
        .writeHead(200, {
          'Content-disposition': 'inline; filename=' + downloadName,
          'Content-type': 'application/pdf',
        })
        .end(
          fs.readFileSync(
            path.join(process.env.USER_DATA_PATH, 'invoices', fileName),
          ),
        );
    } catch (ex) {
      // Sentry.captureException(ex);
      res.status(400).json({ success: false });
    }
  }

  res.end();
};
