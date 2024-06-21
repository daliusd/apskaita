import {
  Autocomplete,
  Button,
  Container,
  Grid,
  NumberInput,
  Text,
} from '@mantine/core';
import { useState } from 'react';
import useSWR from 'swr';
import { postProPlan } from '../components/api/postProPlan';
import { getDateString } from '../utils/date';

export default function Admin() {
  const { data: users } = useSWR('/api/users');

  const [user, setUser] = useState('');
  const [months, setMonths] = useState<number | string>(12);
  const [message, setMessage] = useState('');

  if (!users) {
    return null;
  }

  const onProPlan = async () => {
    const result = await postProPlan(user, months);

    if (!result.success) {
      setMessage('Nepavyko nustatyti Pro plano');
      return;
    }

    setMessage(`Pro planas nustatytas iki ${getDateString(result.endDate)}`);
  };

  return (
    <Container size="sm">
      <Grid>
        <Grid.Col span={12}>
          <Autocomplete
            label="Vartotojas"
            data={users ? users.users : []}
            value={user}
            onChange={setUser}
          />
        </Grid.Col>
        <Grid.Col span={12}>
          <NumberInput value={months} onChange={setMonths}></NumberInput>
        </Grid.Col>
        <Grid.Col span={12}>
          <Button onClick={onProPlan}>Pro planas</Button>
        </Grid.Col>
        <Grid.Col span={12}>
          <Text>{message}</Text>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
