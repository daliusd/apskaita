import { NextApiRequest, NextApiResponse } from 'next';

import { getInvoicesCount } from '../../../db/db';

import { dbWrapper } from '../../../db/apiwrapper';
import { defaultOrFirst } from '../../../utils/query';
import { errorHandler } from '../../../utils/report-mailer';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    return dbWrapper(req, res, async (db) => {
      const {
        query: {
          limit,
          offset,
          minDate,
          maxDate,
          seriesName,
          buyer,
          paid,
          invoiceType,
        },
      } = req;

      const count = await getInvoicesCount(db, {
        minDate: minDate && parseInt(defaultOrFirst(minDate), 10),
        maxDate: maxDate && parseInt(defaultOrFirst(maxDate), 10),
        seriesName: seriesName && defaultOrFirst(seriesName),
        invoiceType: invoiceType && defaultOrFirst(invoiceType),
        buyer: buyer && defaultOrFirst(buyer),
        paid: paid && parseInt(defaultOrFirst(paid), 10),
        limit: limit ? parseInt(defaultOrFirst(limit), 10) : 1000,
        offset: offset ? parseInt(defaultOrFirst(offset), 10) : 0,
      });
      return res.json({ count });
    });
  }
};

export default errorHandler(handler);
