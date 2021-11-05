import { NextApiRequest, NextApiResponse } from 'next';

import { getUniqueLineItemsNames } from '../../../db/db';
import { dbWrapper } from '../../../db/apiwrapper';
import { errorHandler } from '../../../utils/report-mailer';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  return dbWrapper(req, res, async (db) => {
    const lineItemsNames = await getUniqueLineItemsNames(db, '');

    return res.json({ lineItemsNames });
  });
};

export default errorHandler(handler);
