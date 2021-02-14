import React from 'react';
import { useSession } from 'next-auth/client';
import { useRouter } from 'next/router';

import InvoiceEdit from '../../components/InvoiceEdit';

import { defaultOrFirst } from '../../utils/query';

export default function InvoiceNew() {
  const [session] = useSession();
  const router = useRouter();

  const { sourceId } = router.query;

  if (!session) {
    return null;
  }

  return <InvoiceEdit sourceId={defaultOrFirst(sourceId)} />;
}
