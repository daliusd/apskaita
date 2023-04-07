import { NextApiRequest, NextApiResponse } from 'next';

import { validSeriesName } from '../../../../db/db';
import { dbWrapper } from '../../../../db/apiwrapper';
import { errorHandler } from '../../../../utils/report-mailer';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  return dbWrapper(req, res, async (db) => {
    const {
      query: { name, invoiceType, invoiceId },
    } = req;

    const valid = await validSeriesName(
      db,
      typeof name === 'string' ? name : name[0],
      typeof invoiceType === 'string' ? invoiceType : invoiceType[0],
      invoiceId &&
        parseInt(typeof invoiceId === 'string' ? invoiceId : invoiceId[0], 10),
    );

    return res.json({ valid });
  });
};

export default errorHandler(handler);
