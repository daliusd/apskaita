import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

import InvoiceEdit from '../../../components/InvoiceEdit/InvoiceEdit';

export default function InvoiceById() {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session || !router.query.id) {
    return null;
  }

  const { id } = router.query;

  return <InvoiceEdit invoiceId={typeof id === 'string' ? id : id[0]} />;
}
