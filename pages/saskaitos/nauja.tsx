import React, { useState } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import Grid from '@material-ui/core/Grid';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Apie() {
  const { data, error } = useSWR('/api/initial', fetcher);
  const [buyer, setBuyer] = useState('');

  if (error) return <div>failed to load</div>;
  if (!data) return <LinearProgress />;

  return (
    <Grid container spacing={2}>
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
