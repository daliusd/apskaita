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

      const fullFileName = path.join(
        process.env.USER_DATA_PATH,
        'invoices',
        fileName,
      );

      if (!fs.existsSync(fullFileName)) {
        await sendReportMessage(
          `haiku.lt server side pdf/id/name file not found`,
          new Error(`File ${fullFileName} not found`),
          req,
        );
        res.status(404).json({
          success: false,
          message: 'Failas nerastas',
        });
        return;
      }

      res
        .writeHead(200, {
          'Content-disposition': 'inline; filename=' + downloadName,
          'Content-type': 'application/pdf',
        })
        .end(fs.readFileSync(fullFileName));
    } catch (ex) {
      await sendReportMessage(`haiku.lt server side pdf/id/name`, ex, req);
      res.status(400).json({ success: false });
    }
  }

  res.end();
};

export default errorHandler(handler);
