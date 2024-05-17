import { useSession } from 'next-auth/react';

import { ExpenseEdit } from '../../components/expenses/ExpenseEdit';

export default function InvoiceNew() {
  const { data: session } = useSession();

  if (!session) {
    return null;
  }

  return <ExpenseEdit />;
}
