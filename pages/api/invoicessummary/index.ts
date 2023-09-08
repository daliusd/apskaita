import { NextApiRequest, NextApiResponse } from 'next';

import { getInvoicesSummary } from '../../../db/db';

import { dbWrapper } from '../../../db/apiwrapper';
import { defaultOrFirst } from '../../../utils/query';
import { errorHandler } from '../../../utils/report-mailer';

const flagToName = {
  0: 'standard',
  1: 'proforma',
  2: 'credit',
};

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

      const summaryData = await getInvoicesSummary(db, {
        minDate: minDate && parseInt(defaultOrFirst(minDate), 10),
        maxDate: maxDate && parseInt(defaultOrFirst(maxDate), 10),
        seriesName: seriesName && defaultOrFirst(seriesName),
        invoiceType: invoiceType && defaultOrFirst(invoiceType),
        buyer: buyer && defaultOrFirst(buyer),
        paid: paid && parseInt(defaultOrFirst(paid), 10),
        limit: limit ? parseInt(defaultOrFirst(limit), 10) : 1000,
        offset: offset ? parseInt(defaultOrFirst(offset), 10) : 0,
      });

      const summary = {};
      for (const data of summaryData) {
        summary[flagToName[data.flags] + (data.paid ? 'Paid' : 'Unpaid')] = {
          price: data.price,
          vat: data.vat,
          cnt: data.cnt,
        };
      }

      return res.json(summary);
    });
  }
};

export default errorHandler(handler);
