import { useMemo } from 'react';
import { Card } from '@mantine/core';
import { BarChart } from '@mantine/charts';

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

  let series = [
    { label: 'Viso', name: 'total', color: '#82ca9d' },
    { label: 'Neapmokėta', name: 'unpaid', color: '#da7282' },
  ];

  if (isVatPayer) {
    series.push({ label: 'PVM', name: 'vat', color: '#8884d8' });
  }

  return (
    <Card withBorder shadow="sm">
      <BarChart
        h={300}
        data={graphData}
        dataKey="name"
        unit="€"
        withTooltip
        withLegend
        series={series}
      />
    </Card>
  );
}

function dateToMonthString(d: Date): any {
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
}
