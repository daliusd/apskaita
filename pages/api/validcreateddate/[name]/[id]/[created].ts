import { NextApiRequest, NextApiResponse } from 'next';

import { validCreatedDate } from '../../../../../db/db';
import { dbWrapper } from '../../../../../db/apiwrapper';
import { init } from '../../../../../utils/sentry';

init();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  return dbWrapper(req, res, async (db) => {
    const {
      query: { name, id, created, invoiceId },
    } = req;

    const result = await validCreatedDate(
      db,
      typeof name === 'string' ? name : name[0],
      parseInt(typeof id === 'string' ? id : id[0], 10),
      parseInt(typeof created === 'string' ? created : created[0], 10),
      invoiceId &&
        parseInt(typeof invoiceId === 'string' ? invoiceId : invoiceId[0], 10),
    );

    return res.json(result);
  });
};
