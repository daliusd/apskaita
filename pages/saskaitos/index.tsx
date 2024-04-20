import { useState } from 'react';
import { Button, Grid, Title, Radio, Group } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { DateInput } from '@mantine/dates';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useDebounce } from 'react-use';

import Invoices from '../../components/Invoices';
import BuyerFirstLineInput from '../../components/inputs/BuyerFirstLineInput';
import SeriesNameInput from '../../components/inputs/SeriesNameInput';
import { getMsSinceEpoch } from '../../utils/date';
import { DefaultDates } from '../../components/inputs/DefaultDates';

export default function Index() {
  const { data: session } = useSession();
  const router = useRouter();

  const [minDate, setMinDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d;
  });
  const [maxDate, setMaxDate] = useState(() => new Date());
  const [buyer, setBuyer] = useState('');
  const [seriesName, setSeriesName] = useState('');
  const [paid, setPaid] = useState('all');
  const [invoiceType, setInvoiceType] = useState('all');

  const [debouncedSeriesName, setDebouncedSeriesName] = useState('');
  useDebounce(() => setDebouncedSeriesName(seriesName), 500, [seriesName]);

  const [debouncedBuyer, setDebouncedBuyer] = useState('');
  useDebounce(() => setDebouncedBuyer(buyer), 500, [buyer]);

  if (!session) {
    return null;
  }

  const onClickCreateInvoice = () => {
    router.push('/saskaitos/nauja');
  };

  return (
    <Grid gutter={{ base: 24 }}>
      <Grid.Col span={{ base: 12 }}>
        <Title order={2}>Sąskaitos</Title>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Grid gutter={{ base: 12 }}>
          <Grid.Col span={12}>
            <Button
              aria-label="Nauja sąskaita faktūra"
              variant="filled"
              leftSection={<IconPlus />}
              onClick={onClickCreateInvoice}
            >
              Nauja sąskaita faktūra
            </Button>
          </Grid.Col>
          <Grid.Col span={12}>
            <Title order={3}>Filtrai</Title>
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
          <DefaultDates setFromDate={setMinDate} setToDate={setMaxDate} />

          <Grid.Col span={12}>
            <Radio.Group
              name="invoiceType"
              label="Sąskaitos tipas"
              aria-label="Sąskaitos tipas"
              value={invoiceType}
              onChange={setInvoiceType}
            >
              <Group mt="xs">
                <Radio value="all" label="Visos" />
                <Radio value="standard" label="Standartinės" />
                <Radio value="proforma" label="Išankstinės" />
                <Radio value="credit" label="Kreditinės" />
              </Group>
            </Radio.Group>
          </Grid.Col>

          <Grid.Col span={12}>
            <SeriesNameInput
              seriesName={seriesName}
              onChange={setSeriesName}
              disabled={false}
              invoiceType={invoiceType}
            />
          </Grid.Col>

          <Grid.Col span={12}>
            <BuyerFirstLineInput
              buyer={buyer}
              onChange={setBuyer}
              disabled={false}
            />
          </Grid.Col>

          <Grid.Col span={12}>
            <Radio.Group
              name="paidStatus"
              label="Apmokėjimas"
              aria-label="Apmokėjimas"
              value={paid}
              onChange={setPaid}
            >
              <Group mt="xs">
                <Radio value="all" label="Visos" />
                <Radio value="paid" label="Apmokėtos" />
                <Radio value="unpaid" label="Neapmokėtos" />
              </Group>
            </Radio.Group>
          </Grid.Col>
        </Grid>
      </Grid.Col>

      <Grid.Col span={{ base: 12, md: 6 }}>
        <Grid gutter={{ base: 12 }}>
          <Grid.Col span={12}>
            <Title order={3}>Sąskaitos faktūros</Title>
          </Grid.Col>

          <Invoices
            minDate={getMsSinceEpoch(minDate)}
            maxDate={getMsSinceEpoch(maxDate)}
            seriesName={debouncedSeriesName}
            buyer={debouncedBuyer}
            paid={
              paid === 'paid' ? true : paid === 'unpaid' ? false : undefined
            }
            invoiceType={invoiceType}
            limit={5}
            showSummary={true}
          />
        </Grid>
      </Grid.Col>
    </Grid>
  );
}
