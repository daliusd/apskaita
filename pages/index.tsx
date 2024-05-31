import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';

const MainInfo = dynamic(() => import('../components/MainInfo'));
const FirstPage = dynamic(() => import('../components/FirstPage'));

export default function Index() {
  const { status } = useSession();

  if (status === 'loading') {
    return null;
  }

  if (status === 'unauthenticated') {
    return <FirstPage />;
  }

  return <MainInfo />;
}
