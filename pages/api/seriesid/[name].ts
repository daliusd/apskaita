import { NextApiRequest, NextApiResponse } from 'next';

// import { init } from '../../../utils/sentry';
import { getNextSeriesId } from '../../../db/db';
import { dbWrapper } from '../../../db/apiwrapper';

// init();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  return dbWrapper(req, res, async (db) => {
    const seriesName =
      typeof req.query.name === 'string' ? req.query.name : req.query.name[0];
    const seriesId = await getNextSeriesId(db, seriesName);

    return res.json({ seriesId });
  });
};
