import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import InputAdornment from '@material-ui/core/InputAdornment';
import Autocomplete from '@material-ui/lab/Autocomplete';
import useSWR from 'swr';
import { useDebounce } from 'react-recipes';

import { ILineItem } from '../db/db';

interface Props {
  lineItem: ILineItem;
  onChange: (lineItem: ILineItem) => void;
  deleteEnabled: boolean;
  onDelete: () => void;
}

export default function LineItemEdit({
  lineItem,
  onChange,
  onDelete,
  deleteEnabled,
}: Props) {
  const [amount, setAmount] = useState(lineItem.amount.toString());
  const [price, setPrice] = useState(
    lineItem.price === 0 ? '' : lineItem.price.toString(),
  );

  const debouncedLineItemName = useDebounce(lineItem.name, 500);
  const { data } = useSWR(`/api/uniquelineitemsnames/${debouncedLineItemName}`);

  return (
    <>
      <Grid item xs={12}>
        <Autocomplete
          id="combo-box-demo"
          options={data ? data.lineItemsNames : []}
          fullWidth
          value={lineItem.name}
          onInputChange={(_e, newValue) => {
            onChange({ ...lineItem, name: newValue });
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
            onChange({
              ...lineItem,
              amount: parseInt(e.target.value, 10) || 0,
            });
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
            onChange({ ...lineItem, price: parseFloat(e.target.value) || 0 });
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
