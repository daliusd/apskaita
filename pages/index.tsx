import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { FirstPage } from '../components/FirstPage';

const MainInfo = dynamic(() => import('../components/MainInfo'));

export default function Index() {
  const { data: session } = useSession();

  if (!session) {
    return <FirstPage />;
  }

  return <MainInfo />;
}
