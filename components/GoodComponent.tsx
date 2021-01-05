import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
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
  const [price, setPrice] = useState(good.price.toString());

  return (
    <>
      <Grid item xs={12}>
        <TextField
          label="Paslaugos pavadinimas"
          value={good.name}
          onChange={(e) => {
            onChange({ ...good, name: e.target.value });
          }}
          fullWidth
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
