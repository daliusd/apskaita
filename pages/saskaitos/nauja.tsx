import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

import InvoiceEdit from '../../components/InvoiceEdit/InvoiceEdit';

import { defaultOrFirst } from '../../utils/query';

export default function InvoiceNew() {
  const { data: session } = useSession();
  const router = useRouter();

  const { sourceId } = router.query;

  if (!session) {
    return null;
  }

  return <InvoiceEdit sourceId={defaultOrFirst(sourceId)} />;
}
