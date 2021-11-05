import { NextApiRequest, NextApiResponse } from 'next';

import { getUniqueBuyers } from '../../../db/db';
import { dbWrapper } from '../../../db/apiwrapper';
import { errorHandler } from '../../../utils/report-mailer';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  return dbWrapper(req, res, async (db) => {
    const buyers = await getUniqueBuyers(db, '');

    return res.json({ buyers });
  });
};

export default errorHandler(handler);
