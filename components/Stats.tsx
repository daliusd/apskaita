import { Grid, Loader, Text, Title } from '@mantine/core';
import { useMemo } from 'react';
import useSWR from 'swr';
import { getMsSinceEpoch } from '../utils/date';
import StatsGraph from './StatsGraph';
import Link from '../src/Link';

export default function Stats({
  fromDateInit,
  toDateInit,
}: {
  fromDateInit?: number;
  toDateInit?: number;
}) {
  const { data: vatpayerData } = useSWR('/api/settings/vatpayer');
  const isVatPayer = vatpayerData?.value === '1';

  const fromDate = useMemo(() => {
    if (fromDateInit) {
      return fromDateInit;
    } else {
      let d = new Date();
      let today = d.getDate();
      d.setDate(1);
      d.setUTCHours(0, 0, 0, 0);
      d.setMonth(d.getMonth() - (today <= 10 ? 12 : 11));
      return getMsSinceEpoch(d);
    }
  }, [fromDateInit]);

  const toDate = useMemo(() => {
    if (toDateInit) {
      return toDateInit;
    } else {
      return getMsSinceEpoch(new Date());
    }
  }, [toDateInit]);

  const query = `/api/stats?from=${fromDate}&to=${toDate}`;
  const { data, error } = useSWR(query);

  const totalPaid = useMemo(
    () =>
      data &&
      data.stats.reduce((c, i) => {
        return (
          c + (i.flags === 0 && i.paid ? i.total : i.flags === 2 ? -i.total : 0)
        );
      }, 0),
    [data],
  );

  const totalUnpaid = useMemo(
    () =>
      data &&
      data.stats.reduce((c, i) => {
        return c + (i.flags === 0 && !i.paid ? i.total : 0);
      }, 0),
    [data],
  );

  const totalVat = useMemo(
    () =>
      data &&
      data.stats.reduce((c, i) => {
        return (
          c +
          (i.flags === 0 && i.vat ? i.vat : i.flags === 2 && i.vat ? -i.vat : 0)
        );
      }, 0),
    [data],
  );

  if (error) {
    return null;
  }

  if (!data)
    return (
      <Grid.Col span={12}>
        <Loader />
      </Grid.Col>
    );

  if (totalPaid === 0 && totalUnpaid === 0) {
    return null;
  }

  return (
    <>
      <Grid.Col span={12}>
        <Title order={3}>Statistika pagal paskutinius 12+ mėnesių</Title>
      </Grid.Col>
      <Grid.Col span={12}>
        <StatsGraph data={data} fromDate={fromDate} toDate={toDate} />
      </Grid.Col>
      <Grid.Col span={12}>
        <Text>
          Viso: {(totalPaid + totalUnpaid) / 100}€
          {totalUnpaid > 0 && totalPaid !== 0
            ? ', Neapmokėta: ' + totalUnpaid / 100 + '€'
            : ''}
          {isVatPayer && totalVat > 0 ? ', PVM: ' + totalVat / 100 + '€' : ''}.
        </Text>
      </Grid.Col>

      {!isVatPayer && (totalPaid + totalUnpaid) / 100 > 36000 && (
        <Grid.Col span={12}>
          <Text>
            <strong>Perspėjimas:</strong> pajamoms per paskutinius 12 mėnesių
            viršijus 45000€ atsiranda prievolė registruotis PVM mokėtoju.
          </Text>
        </Grid.Col>
      )}

      <Grid.Col span={12}>
        <Text>
          <strong>Pastaba:</strong> Iki 10-tos mėnesio dienos statistika rodoma
          pagal prieš tai buvusius pilnus 12-ką mėnesių ir einamojo mėnesio
          dienas, o po 10-tos dienos pagal prieš tai buvusius 11-ą mėnesių ir
          einamojo mėnesio dienas. Tai padaryta dėl to, kad būtų paprasčiau
          planuoti pajamas. Jei norite detaliau peržiūrėti savo statistiką ir
          patys nustatyti datas pasinaudokite{' '}
          <Link href="/iv-skaiciuokle">
            Individualios Veiklos mokesčių skaičiuokle
          </Link>
          .
        </Text>
      </Grid.Col>
    </>
  );
}

function dateToMonthString(d: Date): any {
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
}
