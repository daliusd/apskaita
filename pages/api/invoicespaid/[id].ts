import { NextApiRequest, NextApiResponse } from 'next';

import { changeInvoicePaidStatus } from '../../../db/db';

import { dbWrapper } from '../../../db/apiwrapper';
import { errorHandler } from '../../../utils/report-mailer';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'PUT') {
    return dbWrapper(req, res, async (db) => {
      const {
        query: { id },
      } = req;

      const invoiceId = parseInt(typeof id === 'string' ? id : id[0], 10);

      await changeInvoicePaidStatus(db, invoiceId, req.body.paid);

      return res.json({ success: true });
    });
  }
};

export default errorHandler(handler);
