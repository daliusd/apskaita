import React from 'react';
import { Grid, CircularProgress } from '@material-ui/core';
import useSWR from 'swr';

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
  const { data, error } = useSWR('/api/invoices?' + params.toString());

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
    <Grid item xs={12}>
      {data.invoices.map((i: IInvoice) => (
        <InvoiceView key={i.id} invoice={i} />
      ))}
    </Grid>
  );
}
