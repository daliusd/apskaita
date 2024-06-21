import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs/promises';
import { getServerSession } from 'next-auth';

import { errorHandler } from '../../utils/report-mailer';
import { authOptions } from './auth/[...nextauth]';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user.email !== process.env.ADMIN_USER) {
    res.status(401);
    return;
  }

  if (req.method === 'GET') {
    const users = (
      await fs.readdir(path.join(process.env.USER_DATA_PATH, 'db'))
    ).map((n) => n.slice(0, n.length - 3));

    return res.json({ users });
  }
};

export default errorHandler(handler);
