import { NextApiRequest, NextApiResponse } from 'next';

import { init } from '../../../utils/sentry';

init();

import { changeInvoicePaidStatus } from '../../../db/db';

import { dbWrapper } from '../../../db/apiwrapper';

export default async (req: NextApiRequest, res: NextApiResponse) => {
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
