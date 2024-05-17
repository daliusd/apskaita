import useSWR from 'swr';

import { ExpenseEdit } from './ExpenseEdit';
import { Loader } from '@mantine/core';

export interface Props {
  expenseId: string;
}

export function ExpenseEditById({ expenseId }: Props) {
  const {
    data: expense,
    error,
    isLoading,
  } = useSWR('/api/expenses/' + expenseId);

  if (error) {
    return <div>Klaida atsisiunčiant išlaidų išrašą.</div>;
  }

  if (isLoading) {
    return <Loader />;
  }

  if (expense) {
    return (
      <ExpenseEdit
        key={JSON.stringify(expense.expense)}
        expense={expense.expense}
      />
    );
  }
}
