import { NextApiRequest, NextApiResponse } from 'next';

import { getUniqueSeriesNames } from '../../../db/db';
import { dbWrapper } from '../../../db/apiwrapper';
import { init } from '../../../utils/sentry';

init();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  return dbWrapper(req, res, async (db) => {
    let seriesNames = await getUniqueSeriesNames(db, '');
    if (seriesNames.length === 0) {
      seriesNames = ['HAIKU'];
    }

    return res.json({ seriesNames });
  });
};
