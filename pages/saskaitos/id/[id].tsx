import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

import InvoiceEdit from '../../../components/InvoiceEdit/InvoiceEdit';

export default function InvoiceNew() {
  const { data: session } = useSession();
  const router = useRouter();
  const { id } = router.query;

  if (!session) {
    return null;
  }

  return <InvoiceEdit invoiceId={typeof id === 'string' ? id : id[0]} />;
}
