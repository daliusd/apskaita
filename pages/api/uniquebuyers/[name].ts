import { NextApiRequest, NextApiResponse } from 'next';

import { getUniqueBuyers } from '../../../db/db';
import { dbWrapper } from '../../../db/apiwrapper';
import { init } from '../../../utils/sentry';

init();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  return dbWrapper(req, res, async (db) => {
    const nameStart =
      typeof req.query.name === 'string' ? req.query.name : req.query.name[0];
    const buyers = await getUniqueBuyers(db, nameStart);

    return res.json({ buyers });
  });
};
