import React, { useEffect, useState } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import Grid from '@material-ui/core/Grid';
import Autocomplete from '@material-ui/lab/Autocomplete';
import useSWR from 'swr';
import { useSession } from 'next-auth/client';
import { KeyboardDatePicker } from '@material-ui/pickers';
import { useDebounce } from 'react-recipes';

import { Good } from '../../db/db';
import GoodComponent from '../../components/GoodComponent';

export default function InvoiceNew() {
  const [session] = useSession();

  const { data, error } = useSWR('/api/initial');
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

  const debouncedSeriesName = useDebounce(seriesName, 500);
  const seriesResp = useSWR(
    debouncedSeriesName ? ['/api/seriesid/', debouncedSeriesName] : null,
  );

  useEffect(() => {
    if (seriesResp.data) {
      setSeriesId(seriesResp.data.seriesId);
    }
  }, [seriesResp.data]);

  const [goods, setGoods] = useState<Good[]>([
    { id: 1, name: '', amount: 1, price: 0 },
  ]);

  if (!session) {
    return null;
  }

  if (error) return <div>failed to load</div>;
  if (!data) return <LinearProgress />;

  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <Autocomplete
          id="combo-box-demo"
          options={data.seriesNames}
          fullWidth
          value={seriesName}
          onInputChange={(_e, newValue) => {
            setSeriesName(newValue);
          }}
          freeSolo
          renderInput={(params) => (
            <TextField {...params} label="Serijos pavadinimas" />
          )}
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

      {goods.map((g) => {
        return (
          <GoodComponent
            key={g.id}
            good={g}
            deleteEnabled={goods.length > 1}
            onDelete={() => {
              setGoods(goods.filter((gt) => gt.id != g.id));
            }}
            onChange={(gn) => {
              setGoods(
                goods.map((g) => {
                  if (gn.id != g.id) {
                    return g;
                  }
                  return gn;
                }),
              );
            }}
          />
        );
      })}

      <Grid item xs={12}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setGoods([
              ...goods,
              {
                id: Math.max(...goods.map((g) => g.id)) + 1,
                name: '',
                amount: 1,
                price: 0,
              },
            ]);
          }}
        >
          Pridėti paslaugą
        </Button>
      </Grid>

      <Grid item xs={12}>
        <Button type="submit" variant="contained" color="primary">
          Sukurti
        </Button>
      </Grid>
    </Grid>
  );
}
