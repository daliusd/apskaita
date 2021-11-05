import { NextApiRequest, NextApiResponse } from 'next';

import { validSeriesNumber } from '../../../../db/db';
import { dbWrapper } from '../../../../db/apiwrapper';
import { errorHandler } from '../../../../utils/report-mailer';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  return dbWrapper(req, res, async (db) => {
    const {
      query: { name, id, invoiceId },
    } = req;

    const valid = await validSeriesNumber(
      db,
      typeof name === 'string' ? name : name[0],
      parseInt(typeof id === 'string' ? id : id[0], 10),
      invoiceId &&
        parseInt(typeof invoiceId === 'string' ? invoiceId : invoiceId[0], 10),
    );

    return res.json({ valid });
  });
};

export default errorHandler(handler);
