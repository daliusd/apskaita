import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import InputAdornment from '@material-ui/core/InputAdornment';
import Autocomplete from '@material-ui/lab/Autocomplete';
import useSWR from 'swr';
import { useDebounce } from 'react-recipes';

import { Good } from '../db/db';

interface Props {
  good: Good;
  onChange: (good: Good) => void;
  deleteEnabled: boolean;
  onDelete: () => void;
}

export default function GoodComponent({
  good,
  onChange,
  onDelete,
  deleteEnabled,
}: Props) {
  const [amount, setAmount] = useState(good.amount.toString());
  const [price, setPrice] = useState(
    good.price === 0 ? '' : good.price.toString(),
  );

  const debouncedGoodName = useDebounce(good.name, 500);
  const { data } = useSWR(`/api/uniquegoodsnames/${debouncedGoodName}`);

  return (
    <>
      <Grid item xs={12}>
        <Autocomplete
          id="combo-box-demo"
          options={data ? data.goodsNames : []}
          fullWidth
          value={good.name}
          onInputChange={(_e, newValue) => {
            onChange({ ...good, name: newValue });
          }}
          freeSolo
          renderInput={(params) => (
            <TextField {...params} label="Paslaugos pavadinimas" />
          )}
        />
      </Grid>

      <Grid item xs={4}>
        <TextField
          type="number"
          label="Kiekis"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            onChange({ ...good, amount: parseInt(e.target.value, 10) || 0 });
          }}
          fullWidth
        />
      </Grid>

      <Grid item xs={4}>
        <TextField
          type="number"
          label="Kaina"
          value={price}
          onChange={(e) => {
            setPrice(e.target.value);
            onChange({ ...good, price: parseFloat(e.target.value) || 0 });
          }}
          fullWidth
          InputProps={{
            endAdornment: <InputAdornment position="end">€</InputAdornment>,
          }}
        />
      </Grid>

      {deleteEnabled && (
        <Grid item xs={4}>
          <Button variant="contained" color="primary" onClick={onDelete}>
            Pašalinti
          </Button>
        </Grid>
      )}
    </>
  );
}
