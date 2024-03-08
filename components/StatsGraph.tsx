import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { ReactNode, useMemo } from 'react';
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

export default function StatsGraph({
  fromDate,
  toDate,
  data,
}: {
  data?: any;
  fromDate?: number;
  toDate?: number;
}) {
  const { data: vatpayerData } = useSWR('/api/settings/vatpayer');
  const isVatPayer = vatpayerData?.value === '1';

  const { graphData, showGraph } = useMemo(() => {
    let graphData = [];
    let showGraph = false;

    if (!data) {
      return { graphData, showGraph };
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
          showGraph = true;
        } else {
          monthData.total += total;
          monthData.unpaid += total;
          showGraph = true;
        }

        if (item.vat) {
          monthData.vat += item.vat;
          showGraph = true;
        }
      } else if (item.flags === 2) {
        monthData.total -= item.total;
        showGraph = true;

        if (item.vat) {
          monthData.vat -= item.vat;
        }
      }
      graphByMonth.set(item.month, monthData);
    }

    if (showGraph) {
      const d = new Date(fromDate);
      while (!graphByMonth.has(dateToMonthString(d)) && d < new Date()) {
        d.setMonth(d.getMonth() + 1);
      }
      while (+d <= toDate) {
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
    return { graphData, showGraph };
  }, [data, fromDate, toDate]);

  if (!showGraph) {
    return null;
  }

  return (
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
          <Bar name="Neapmokėta" dataKey="unpaid" fill="#da7282" unit="€" />
          {isVatPayer && (
            <Bar name="PVM" dataKey="vat" fill="#8884d8" unit="€" />
          )}
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
}

function dateToMonthString(d: Date): any {
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
}
