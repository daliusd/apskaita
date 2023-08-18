import { NextApiRequest, NextApiResponse } from 'next';

import { getLastSellerInformation } from '../../../../db/db';
import { dbWrapper } from '../../../../db/apiwrapper';
import { errorHandler } from '../../../../utils/report-mailer';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    return dbWrapper(req, res, async (db) => {
      const {
        query: { name, language },
      } = req;

      const value = await getLastSellerInformation(
        db,
        typeof name === 'string' ? name : name[0],
        typeof language === 'string' ? language : language[0],
      );
      return res.json(value);
    });
  }
};

export default errorHandler(handler);
