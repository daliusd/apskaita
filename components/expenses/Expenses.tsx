import { useState, useEffect } from 'react';
import { Grid, Loader, Text } from '@mantine/core';
import useSWR, { mutate } from 'swr';

import { IExpense } from '../../db/db';
import ExpenseView from './ExpenseView';

interface Props {
  query: string;
}

export default function Expenses(props: Props) {
  const { data, error } = useSWR(props.query);
  const [sum, setSum] = useState(0);

  useEffect(() => {
    if (data && data.expenses) {
      setSum(data.expenses.map((e) => e.price).reduce((a, b) => a + b, 0));
    }
  }, [data]);

  if (error)
    return <Grid.Col span={12}>Klaida parsiunčiant išlaidas.</Grid.Col>;
  if (!data)
    return (
      <Grid.Col span={12}>
        <Loader />
      </Grid.Col>
    );

  if (!data.expenses.length)
    return (
      <Grid.Col span={12}>Nerasta išlaidų įrašų pagal šiuos filtrus.</Grid.Col>
    );

  return (
    <>
      <Grid.Col span={12}>
        <Text>
          Rasta išlaidų įrašų pagal filtrus: {data.expenses.length}. Šių išlaidų
          įrašų bendra suma {sum / 100} €.
          {data.expenses.length === 1000 &&
            ' 1000 įrašų yra maksimalus rodomas skaičius, todėl gali būti, kad rodomi ne visi įrašai.'}
        </Text>
      </Grid.Col>
      <Grid.Col span={12}>
        {data.expenses.map((e: IExpense) => (
          <ExpenseView
            key={e.id}
            expense={e}
            onChange={() => mutate(props.query)}
          />
        ))}
      </Grid.Col>
    </>
  );
}
