import React, { useState, useEffect } from 'react';
import { Grid, CircularProgress } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import useSWR, { mutate } from 'swr';

import { IExpense } from '../db/db';
import ExpenseView from './ExpenseView';

interface Props {
  query: string;
}

export default function Expenses(props: Props) {
  const { data, error } = useSWR(props.query);
  const [sum, setSum] = useState(0);

  useEffect(() => {
    if (data && data.expenses) {
      setSum(
        data.expenses.map((e) => e.price * 100).reduce((a, b) => a + b, 0),
      );
    }
  }, [data]);

  if (error)
    return (
      <Grid item xs={12}>
        Klaida parsiunčiant išlaidas.
      </Grid>
    );
  if (!data)
    return (
      <Grid item xs={12}>
        <CircularProgress />
      </Grid>
    );

  if (!data.expenses.length)
    return (
      <Grid item xs={12}>
        Nerasta išlaidų įrašų pagal šiuos filtrus.
      </Grid>
    );

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="body1" component="div">
          Rasta išlaidų įrašų pagal filtrus: {data.expenses.length}. Šių išlaidų
          įrašų bendra suma {sum / 100} €.
        </Typography>
      </Grid>
      <Grid item xs={12}>
        {data.expenses.map((e: IExpense) => (
          <ExpenseView
            key={e.id}
            expense={e}
            onChange={() => mutate(props.query)}
          />
        ))}
      </Grid>
    </>
  );
}
