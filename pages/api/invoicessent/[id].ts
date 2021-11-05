import { NextApiRequest, NextApiResponse } from 'next';

import { changeInvoiceSentStatus } from '../../../db/db';

import { dbWrapper } from '../../../db/apiwrapper';
import { errorHandler } from '../../../utils/report-mailer';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'PUT') {
    return dbWrapper(req, res, async (db) => {
      const {
        query: { id },
      } = req;

      const invoiceId = parseInt(typeof id === 'string' ? id : id[0], 10);

      await changeInvoiceSentStatus(db, invoiceId, req.body.sent);

      return res.json({ success: true });
    });
  }
};

export default errorHandler(handler);
