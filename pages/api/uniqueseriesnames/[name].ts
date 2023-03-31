import { NextApiRequest, NextApiResponse } from 'next';

import { getUniqueSeriesNames } from '../../../db/db';
import { dbWrapper } from '../../../db/apiwrapper';
import { errorHandler } from '../../../utils/report-mailer';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  return dbWrapper(req, res, async (db) => {
    const nameStart =
      typeof req.query.name === 'string' ? req.query.name : req.query.name[0];
    const invoiceType =
      req.query.invoiceType &&
      (typeof req.query.invoiceType === 'string'
        ? req.query.invoiceType
        : req.query.invoiceType[0]);
    let seriesNames = await getUniqueSeriesNames(db, nameStart, invoiceType);
    if (seriesNames.length === 0) {
      seriesNames = [];
    }

    return res.json({ seriesNames });
  });
};

export default errorHandler(handler);
