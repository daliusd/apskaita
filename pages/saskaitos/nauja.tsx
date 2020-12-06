import React, { useEffect, useState } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import Grid from '@material-ui/core/Grid';
import useSWR from 'swr';
import { useSession } from 'next-auth/client';
import { KeyboardDatePicker } from '@material-ui/pickers';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function InvoiceNew() {
  const [session] = useSession();

  const { data, error } = useSWR('/api/initial', fetcher);
  const [seriesName, setSeriesName] = useState('');
  const [seriesId, setSeriesId] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date());
  const [buyer, setBuyer] = useState('');

  useEffect(() => {
    if (data) {
      setSeriesName(data.seriesNames[0]);
      setSeriesId(data.seriesId);
    }
  }, [data]);

  if (!session) {
    return null;
  }

  if (error) return <div>failed to load</div>;
  if (!data) return <LinearProgress />;

  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <TextField
          label="Serijos pavadinimas"
          value={seriesName}
          onChange={(e) => {
            setSeriesName(e.target.value);
          }}
          fullWidth
        />
      </Grid>

      <Grid item xs={6}>
        <TextField
          type="number"
          label="Serijos numeris"
          value={seriesId}
          onChange={(e) => {
            setSeriesId(e.target.value);
          }}
          fullWidth
        />
      </Grid>

      <Grid item xs={12}>
        <KeyboardDatePicker
          label="Sąskaitos data"
          value={invoiceDate}
          onChange={setInvoiceDate}
          format="yyyy-MM-dd"
          fullWidth
          invalidDateMessage="Neteisingas datos formatas"
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          label="Pirkėjas"
          value={buyer}
          onChange={(e) => {
            setBuyer(e.target.value);
          }}
          fullWidth
          multiline
          rows={4}
          variant="outlined"
        />
      </Grid>
      <Grid item xs={12}>
        <Button type="submit" variant="contained" color="primary">
          Sukurti
        </Button>
      </Grid>
    </Grid>
  );
}
