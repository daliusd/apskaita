import { NextApiRequest, NextApiResponse } from 'next';

import { getExpenseStats } from '../../../db/db';
import { dbWrapper } from '../../../db/apiwrapper';
import { errorHandler } from '../../../utils/report-mailer';
import { defaultOrFirst } from '../../../utils/query';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  return dbWrapper(req, res, async (db) => {
    const {
      query: { from, to },
    } = req;

    const stats = await getExpenseStats(
      db,
      from && parseInt(defaultOrFirst(from), 10),
      to && parseInt(defaultOrFirst(to), 10),
    );

    return res.json({ stats });
  });
};

export default errorHandler(handler);
