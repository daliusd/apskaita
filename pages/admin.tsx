import {
  Autocomplete,
  Button,
  Container,
  Grid,
  Group,
  NumberInput,
  Text,
} from '@mantine/core';
import { useState } from 'react';
import useSWR from 'swr';
import { postProPlan } from '../components/api/postProPlan';
import { getDateString, getMsSinceEpoch } from '../utils/date';
import { IInvoice } from '../db/db';
import { getSeriesid } from '../components/api/getSeriesid';
import { postInvoices } from '../components/api/postInvoices';
import { useRouter } from 'next/router';
import { putInvoicespdf } from '../components/api/putInvoicespdf';

export default function Admin() {
  const { data: users } = useSWR('/api/users');
  const router = useRouter();

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

  const onInvoice = async () => {
    const seriesResult = await getSeriesid('DD');
    if (!seriesResult.success) {
      setMessage('Nepavyko gauti serijos numerio');
      return;
    }

    const price = parseInt(process.env.NEXT_PUBLIC_PROPS_PRICE, 10) * 100;

    const invoice: IInvoice = {
      invoiceType: 'standard',
      seriesName: 'DD',
      seriesId: seriesResult.seriesId,
      created: getMsSinceEpoch(new Date()),
      price,
      buyer: user,
      email: user,
      seller: '',
      issuer: '',
      extra: '',
      language: 'lt',
      lineItems: [
        {
          id: 0,
          name: 'Haiku.lt Pro planas',
          unit: 'vnt.',
          amount: 1,
          price,
        },
      ],
      vat: 0,
    };

    const result = await postInvoices(invoice, '');
    if (!result.success) {
      setMessage('Nepavyko nustatyti Pro plano');
      return;
    }

    await putInvoicespdf(result.invoiceId);

    router.push(`/saskaitos/id/${result.invoiceId}`);
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
          <Group>
            <Button onClick={onProPlan}>Pro planas</Button>
            <Button onClick={onInvoice}>Išrašyti SF</Button>
          </Group>
        </Grid.Col>
        <Grid.Col span={12}>
          <Text>{message}</Text>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
