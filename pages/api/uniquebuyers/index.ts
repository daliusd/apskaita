import { NextApiRequest, NextApiResponse } from 'next';

import { getUniqueBuyers } from '../../../db/db';
import { dbWrapper } from '../../../db/apiwrapper';
import { init } from '../../../utils/sentry';

init();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  return dbWrapper(req, res, async (db) => {
    const buyers = await getUniqueBuyers(db, '');

    return res.json({ buyers });
  });
};
