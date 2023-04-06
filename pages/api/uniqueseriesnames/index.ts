import { NextApiRequest, NextApiResponse } from 'next';

import { getUniqueSeriesNames } from '../../../db/db';
import { dbWrapper } from '../../../db/apiwrapper';
import { errorHandler } from '../../../utils/report-mailer';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  return dbWrapper(req, res, async (db) => {
    const invoiceType =
      req.query.invoiceType &&
      (typeof req.query.invoiceType === 'string'
        ? req.query.invoiceType
        : req.query.invoiceType[0]);
    const seriesNames = await getUniqueSeriesNames(db, '', invoiceType);

    return res.json({ seriesNames });
  });
};

export default errorHandler(handler);
