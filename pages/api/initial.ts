import { getSession } from 'next-auth/client';

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    return res.json({ email: session.user.email });
  } else {
    res.status(401);
  }
  res.end();
};
