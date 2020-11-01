import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/client';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });
  if (session) {
    return res.json({ email: session.user.email });
  } else {
    res.status(401);
  }
  res.end();
};
