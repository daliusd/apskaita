import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

import { ExpenseEditById } from '../../../components/expenses/ExpenseEditById';

export default function ExpenseById() {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session || !router.query.id) {
    return null;
  }

  const { id } = router.query;

  return <ExpenseEditById expenseId={typeof id === 'string' ? id : id[0]} />;
}
