import { Grid, CircularProgress, Paper, Typography } from '@mui/material';
import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import useSWR from 'swr';

export default function Stats() {
  const query = '/api/stats';
  const { data, error } = useSWR(query);

  const { data: vatpayerData } = useSWR('/api/settings/vatpayer');
  const isVatPayer = vatpayerData?.value === '1';

  const { graphData, totalUnpaid, totalPaid, totalVat } = useMemo(() => {
    let graphData = [];
    let totalUnpaid = 0;
    let totalPaid = 0;
    let totalVat = 0;

    if (!data) {
      return { graphData, totalUnpaid, totalPaid, totalVat };
    }

    const graphByMonth = new Map();

    for (const item of data.stats) {
      if (!graphByMonth.has(item.month)) {
        graphByMonth.set(item.month, {
          name: item.month,
          total: 0,
          vat: 0,
          unpaid: 0,
        });
      }

      const monthData = graphByMonth.get(item.month);
      if (item.flags === 0) {
        const total = item.total;
        if (item.paid) {
          monthData.total += total;
          totalPaid += total;
        } else {
          monthData.total += total;
          monthData.unpaid += total;
          totalUnpaid += total;
        }

        if (item.vat) {
          monthData.vat += item.vat;
          totalVat += item.vat;
        }
      } else if (item.flags === 2) {
        monthData.total -= item.total;
        totalPaid -= item.total;

        if (item.vat) {
          monthData.vat -= item.vat;
          totalVat -= item.vat;
        }
      }
      graphByMonth.set(item.month, monthData);
    }

    if (totalPaid > 0 || totalUnpaid > 0) {
      let d = new Date();
      d.setDate(1);
      d.setUTCHours(0, 0, 0, 0);
      d.setMonth(d.getMonth() - 12);
      while (!graphByMonth.has(dateToMonthString(d)) && d < new Date()) {
        d.setMonth(d.getMonth() + 1);
      }
      while (d < new Date()) {
        const monthString = dateToMonthString(d);
        graphData.push(
          graphByMonth.get(monthString) || {
            name: monthString,
            total: 0,
            vat: 0,
            unpaid: 0,
          },
        );

        d.setMonth(d.getMonth() + 1);
      }
    }

    for (const item of graphData) {
      item.total /= 100;
      item.vat /= 100;
      item.unpaid /= 100;
    }
    return { graphData, totalUnpaid, totalPaid, totalVat };
  }, [data]);

  if (error) {
    return null;
  }

  if (!data)
    return (
      <Grid item xs={12}>
        <CircularProgress />
      </Grid>
    );

  if (totalPaid === 0 && totalUnpaid === 0) {
    return null;
  }

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h6" component="h1" noWrap>
          Statistika pagal paskutinius 12+ mėnesių
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Paper
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            height: 300,
          }}
        >
          <ResponsiveContainer>
            <BarChart width={500} height={300} data={graphData}>
              <XAxis dataKey="name" />
              <YAxis unit="€" />
              <Tooltip />
              <Legend />
              <Bar name="Viso" dataKey="total" fill="#82ca9d" unit="€" />
              {totalUnpaid > 0 && totalPaid > 0 && (
                <Bar
                  name="Neapmokėta"
                  dataKey="unpaid"
                  fill="#da7282"
                  unit="€"
                />
              )}
              {isVatPayer && totalVat > 0 && (
                <Bar name="PVM" dataKey="vat" fill="#8884d8" unit="€" />
              )}
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body1" component="div">
          Viso: {(totalPaid + totalUnpaid) / 100}€
          {totalUnpaid > 0 && totalPaid !== 0
            ? ', Neapmokėta: ' + totalUnpaid / 100 + '€'
            : ''}
          {isVatPayer && totalVat > 0 ? ', PVM: ' + totalVat / 100 + '€' : ''}.
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body1" component="div">
          <strong>Pastaba:</strong> Statistika rodoma nuo kiekvieno mėnesio
          pirmos dienos. Todėl matomi paskutiniai pilni 12 mėnesių + einamasis
          mėnuo.
        </Typography>
      </Grid>
    </>
  );
}

function dateToMonthString(d: Date): any {
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
}
