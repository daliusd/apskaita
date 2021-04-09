import { NextApiRequest, NextApiResponse } from 'next';

import { getUniqueSeriesNames } from '../../../db/db';
import { dbWrapper } from '../../../db/apiwrapper';
import { init } from '../../../utils/sentry';

init();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  return dbWrapper(req, res, async (db) => {
    const seriesNames = await getUniqueSeriesNames(db, '');

    return res.json({ seriesNames });
  });
};
