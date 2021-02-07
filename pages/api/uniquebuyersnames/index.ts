import { NextApiRequest, NextApiResponse } from 'next';

import { getUniqueBuyerNames } from '../../../db/db';
import { dbWrapper } from '../../../db/apiwrapper';
import { init } from '../../../utils/sentry';

init();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  return dbWrapper(req, res, async (db) => {
    const buyersNames = await getUniqueBuyerNames(db, '');

    return res.json({ buyersNames });
  });
};
