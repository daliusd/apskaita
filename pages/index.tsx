import React from 'react';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/client';

import IndexPageInfo from '../components/IndexPageInfo';
const MainInfo = dynamic(() => import('../components/MainInfo'));

export default function Index() {
  const [session] = useSession();

  if (!session) {
    return <IndexPageInfo />;
  }

  return <MainInfo />;
}
