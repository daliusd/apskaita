import { useSession } from 'next-auth/react';
import { Pro } from '../components/Pro';

export default function ProPage() {
  const { data: session } = useSession();

  if (!session) {
    return null;
  }

  return <Pro />;
}
