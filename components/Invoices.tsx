import React, { useEffect, useState } from 'react';
import { Grid, CircularProgress } from '@material-ui/core';
import useSWR, { mutate } from 'swr';

import { IInvoice } from '../db/db';
import InvoiceView from './InvoiceView';

interface Props {
  minDate?: number;
  maxDate?: number;
  seriesName?: string;
  buyer?: string;
  paid?: boolean;
  limit?: number;
  offset?: number;
}

export default function Invoices(props: Props) {
  const { minDate, maxDate, seriesName, buyer, paid, limit, offset } = props;
  const args: Record<string, string> = {};

  if (minDate) {
    args.minDate = minDate.toString();
  }
  if (maxDate) {
    args.maxDate = maxDate.toString();
  }
  if (seriesName) {
    args.seriesName = seriesName;
  }
  if (buyer) {
    args.buyer = buyer;
  }
  if (paid !== undefined) {
    args.paid = paid ? '1' : '0';
  }
  if (limit) {
    args.limit = limit.toString();
  }
  if (offset) {
    args.offset = offset.toString();
  }
  const params = new URLSearchParams(args);
  const query = '/api/invoices?' + params.toString();
  const { data, error } = useSWR(query);
  const [sum, setSum] = useState(0);
  const [countUnpaid, setCountUnpaid] = useState(0);
  const [sumUnpaid, setSumUnpaid] = useState(0);

  useEffect(() => {
    if (data && data.invoices) {
      let sum = 0;
      let unpaid = 0;
      let unpaidSum = 0;
      for (const i of data.invoices) {
        sum += i.price;
        if (!i.paid) {
          unpaid++;
          unpaidSum += i.price;
        }
      }

      setSum(sum / 100);
      setCountUnpaid(unpaid);
      setSumUnpaid(unpaidSum / 100);
    }
  }, [data]);

  if (error)
    return (
      <Grid item xs={12}>
        Klaida parsiunčiant sąskaitų faktūrų sąrašą.
      </Grid>
    );
  if (!data)
    return (
      <Grid item xs={12}>
        <CircularProgress />
      </Grid>
    );

  if (!data.invoices.length)
    return (
      <Grid item xs={12}>
        Nerasta sąskaitų faktūrų pagal šiuos filtrus.
      </Grid>
    );

  return (
    <>
      <Grid item xs={12}>
        Rasta sąskaitų faktūrų pagal šiuos filtrus: {data.invoices.length}
        {sum > 0 ? `, kurių bendra suma ${sum} €. ` : '.'}
        {countUnpaid > 0 &&
          `Iš jų neapmokėtų:  ${countUnpaid}` +
            (sumUnpaid > 0 ? `, kurių bendra suma ${sumUnpaid} €.` : '.')}
        {data.invoices.length === 1000 &&
          ' 1000 įrašų yra maksimalus rodomas skaičius, todėl gali būti, kad rodomi ne visos sąskaitos faktūros.'}
      </Grid>
      <Grid item xs={12}>
        {data.invoices.map((i: IInvoice) => (
          <InvoiceView key={i.id} invoice={i} onChange={() => mutate(query)} />
        ))}
      </Grid>
    </>
  );
}
