import { NextApiRequest, NextApiResponse } from 'next';

import { getSeriesNameByType } from '../../../db/db';
import { dbWrapper } from '../../../db/apiwrapper';
import { errorHandler } from '../../../utils/report-mailer';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  return dbWrapper(req, res, async (db) => {
    const invoiceType =
      typeof req.query.invoicetype === 'string'
        ? req.query.invoicetype
        : req.query.invoicetype[0];
    const seriesName = await getSeriesNameByType(db, invoiceType);

    return res.json({ seriesName });
  });
};

export default errorHandler(handler);
