import { NextApiRequest, NextApiResponse } from 'next';

import { getStats } from '../../../db/db';
import { dbWrapper } from '../../../db/apiwrapper';
import { errorHandler } from '../../../utils/report-mailer';
import { defaultOrFirst } from '../../../utils/query';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  return dbWrapper(req, res, async (db) => {
    const {
      query: { from, to, seriesName },
    } = req;

    const stats = await getStats(
      db,
      from && parseInt(defaultOrFirst(from), 10),
      to && parseInt(defaultOrFirst(to), 10),
      defaultOrFirst(seriesName),
    );

    return res.json({ stats });
  });
};

export default errorHandler(handler);
