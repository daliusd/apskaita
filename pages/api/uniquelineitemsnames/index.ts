import { NextApiRequest, NextApiResponse } from 'next';

import { getUniqueLineItemsNames } from '../../../db/db';
import { dbWrapper } from '../../../db/apiwrapper';
// import { init } from '../../../utils/sentry';

// init();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  return dbWrapper(req, res, async (db) => {
    const lineItemsNames = await getUniqueLineItemsNames(db, '');

    return res.json({ lineItemsNames });
  });
};
