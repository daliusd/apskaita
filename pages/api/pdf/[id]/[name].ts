import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';
import {
  errorHandler,
  sendReportMessage,
} from '../../../../utils/report-mailer';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
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
      await sendReportMessage(`haiku.lt server side pdf/id/name`, ex);
      res.status(400).json({ success: false });
    }
  }

  res.end();
};

export default errorHandler(handler);
