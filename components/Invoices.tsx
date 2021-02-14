import React from 'react';
import LinearProgress from '@material-ui/core/LinearProgress';
import Grid from '@material-ui/core/Grid';
import useSWR from 'swr';

import { IInvoice } from '../db/db';
import InvoiceView from './InvoiceView';

interface Props {
  limit?: number;
}

export default function Invoices({ limit }: Props) {
  const { data, error } = useSWR(
    '/api/invoices' + (limit ? `?limit=${limit}` : ''),
  );

  if (error) return <>Klaida parsiunčiant sąskaitų faktūrų sąrašą.</>;
  if (!data) return <LinearProgress />;

  if (!data.invoices.length) return <>Jūs neturite sąskaitų faktūrų.</>;

  return (
    <Grid item xs={12}>
      {data.invoices.map((i: IInvoice) => (
        <InvoiceView key={`${i.id}_${i.paid}`} invoice={i} />
      ))}
    </Grid>
  );
}
