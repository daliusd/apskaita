import { useState, useCallback, useEffect } from 'react';
import { Grid, TextInput, Text, Title } from '@mantine/core';
import { useSession } from 'next-auth/react';
import { useDebounce } from 'react-use';
import Link from '../src/Link';
import { mutate } from 'swr';

import Expenses from '../components/expenses/Expenses';
import ExpenseCreate from '../components/expenses/ExpenseCreate';
import { getMsSinceEpoch } from '../utils/date';
import { DateInput } from '@mantine/dates';

export default function Index() {
  const { data: session } = useSession();

  const [description, setDescription] = useState('');
  const [minDate, setMinDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d;
  });
  const [maxDate, setMaxDate] = useState(() => new Date());

  const [debouncedDescription, setDebouncedDescription] = useState('');
  useDebounce(() => setDebouncedDescription(description), 500, [description]);
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

  const gdrive = session && (session as unknown as { gdrive: boolean }).gdrive;

  return (
    <Grid gutter={{ base: 12 }}>
      <Grid.Col span={12}>
        <Text>
          Čia galite registruoti savo išlaidas.{' '}
          {gdrive
            ? 'Pridėti failai bus saugomi jūsų Google Drive.'
            : 'Jei duotumėte priėjimą prie Google Drive, sistema juos saugotų jūsų Google Drive.'}{' '}
          Daugiau informacijos{' '}
          <Link href="/straipsniai/islaidu-sekimas" color="primary">
            čia
          </Link>
          .
        </Text>
      </Grid.Col>

      <ExpenseCreate onCreate={onCreate} />

      <Grid.Col span={12}>
        <Title order={3}>Filtrai</Title>
      </Grid.Col>

      <Grid.Col span={12}>
        <TextInput
          aria-label="Išlaidų aprašymas ar jo dalis"
          label="Išlaidų aprašymas ar jo dalis"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
          }}
        />
      </Grid.Col>
      <Grid.Col span={6}>
        <DateInput
          label="Minimali data"
          aria-label="Minimali data"
          value={minDate}
          onChange={setMinDate}
          valueFormat="YYYY-MM-DD"
        />
      </Grid.Col>
      <Grid.Col span={6}>
        <DateInput
          label="Maksimali data"
          aria-label="Maksimali data"
          value={maxDate}
          onChange={setMaxDate}
          valueFormat="YYYY-MM-DD"
        />
      </Grid.Col>

      <Grid.Col span={12}>
        <Title order={3}>Išlaidos</Title>
      </Grid.Col>

      <Expenses query={query} />
    </Grid>
  );
}
