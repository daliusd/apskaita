import React from 'react';
import { useSession } from 'next-auth/client';

import InvoiceEdit from '../../components/InvoiceEdit';

export default function InvoiceNew() {
  const [session] = useSession();

  if (!session) {
    return null;
  }

  return <InvoiceEdit />;
}
