import { NextApiRequest, NextApiResponse } from 'next';

import { getStats } from '../../../db/db';
import { dbWrapper } from '../../../db/apiwrapper';
import { errorHandler } from '../../../utils/report-mailer';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  return dbWrapper(req, res, async (db) => {
    const stats = await getStats(db);

    return res.json({ stats });
  });
};

export default errorHandler(handler);
