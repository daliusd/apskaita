import React, { useState } from 'react';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import { Good } from '../db/db';

interface Props {
  good: Good;
}

export default function GoodComponent({ good }: Props) {
  const [name, setName] = useState(good.name);
  const [amount, setAmount] = useState(good.amount.toString());
  const [price, setPrice] = useState(good.price.toString());

  return (
    <>
      <Grid item xs={12}>
        <TextField
          label="Paslaugos pavadinimas"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
          fullWidth
        />
      </Grid>

      <Grid item xs={6}>
        <TextField
          type="number"
          label="Kiekis"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
          }}
          fullWidth
        />
      </Grid>

      <Grid item xs={6}>
        <TextField
          type="number"
          label="Kaina"
          value={price}
          onChange={(e) => {
            setPrice(e.target.value);
          }}
          fullWidth
        />
      </Grid>
    </>
  );
}
