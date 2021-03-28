import React, { useState, useCallback, useEffect } from 'react';
import Grid from '@material-ui/core/Grid';
import { Typography, TextField } from '@material-ui/core';
import { KeyboardDatePicker } from '@material-ui/pickers';
import { useSession } from 'next-auth/client';
import { useDebounce } from 'react-recipes';
import { mutate } from 'swr';

import Expenses from '../components/Expenses';
import ExpenseCreate from '../components/ExpenseCreate';
import { getMsSinceEpoch } from '../utils/date';

export default function Index() {
  const [session] = useSession();

  const [description, setDescription] = useState('');
  const [minDate, setMinDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d;
  });
  const [maxDate, setMaxDate] = useState(() => new Date());

  const debouncedDescription = useDebounce(description, 500);
  const [query, setQuery] = useState('');

  const constructQuery = useCallback(() => {
    const args: Record<string, string> = {};

    if (minDate) {
      args.minDate = getMsSinceEpoch(minDate).toString();
    }
    if (maxDate) {
      args.maxDate = getMsSinceEpoch(maxDate).toString();
    }
    if (debouncedDescription) {
      args.description = debouncedDescription;
    }
    const params = new URLSearchParams(args);
    return '/api/expenses?' + params.toString();
  }, [minDate, maxDate, debouncedDescription]);

  useEffect(() => {
    setQuery(constructQuery());
  }, [constructQuery]);

  const onCreate = async () => {
    await mutate(query);
  };

  if (!session) {
    return null;
  }

  return (
    <Grid container spacing={2}>
      <ExpenseCreate onCreate={onCreate} />

      <Grid item xs={12}>
        <Typography variant="h6" component="h1">
          Filtrai
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <TextField
          inputProps={{ 'aria-label': 'Išlaidų aprašymas' }}
          label="Išlaidų aprašymas"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={6}>
        <KeyboardDatePicker
          label="Minimali data"
          autoOk={true}
          inputProps={{ 'aria-label': 'Maksimali data' }}
          value={minDate}
          onChange={setMinDate}
          format="yyyy-MM-dd"
          fullWidth
          invalidDateMessage={'Neteisingas datos formatas'}
          okLabel="Gerai"
          cancelLabel="Nutraukti"
        />
      </Grid>
      <Grid item xs={6}>
        <KeyboardDatePicker
          label="Maksimali data"
          autoOk={true}
          inputProps={{ 'aria-label': 'Maksimali data' }}
          value={maxDate}
          onChange={setMaxDate}
          format="yyyy-MM-dd"
          fullWidth
          invalidDateMessage={'Neteisingas datos formatas'}
          okLabel="Gerai"
          cancelLabel="Nutraukti"
        />
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h6" component="h1">
          Išlaidos
        </Typography>
      </Grid>

      <Expenses query={query} />
    </Grid>
  );
}
