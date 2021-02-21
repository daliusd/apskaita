import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import InputAdornment from '@material-ui/core/InputAdornment';
import Autocomplete from '@material-ui/lab/Autocomplete';
import ClearIcon from '@material-ui/icons/Clear';
import useSWR from 'swr';
import { useDebounce } from 'react-recipes';

import { ILineItem } from '../db/db';
import { cleanUpString } from '../utils/textutils';

interface Props {
  lineItem: ILineItem;
  idx: number;
  onChange: (lineItem: ILineItem) => void;
  deleteEnabled: boolean;
  onDelete: () => void;
  disabled: boolean;
}

export default function LineItemEdit({
  lineItem,
  idx,
  onChange,
  onDelete,
  deleteEnabled,
  disabled,
}: Props) {
  const [amount, setAmount] = useState(lineItem.amount.toString());
  const [price, setPrice] = useState(
    lineItem.price === 0 ? '' : (lineItem.price / 100).toString(),
  );

  const debouncedLineItemName = useDebounce(lineItem.name, 500);
  const { data } = useSWR(`/api/uniquelineitemsnames/${debouncedLineItemName}`);

  const lid = ` ${idx + 1}`;

  return (
    <>
      <Grid item xs={12}>
        <Autocomplete
          options={data ? data.lineItemsNames.map((i) => i.name) : []}
          fullWidth
          disabled={disabled}
          value={lineItem.name}
          onInputChange={(_e, newValue) => {
            let newPrice = lineItem.price;
            newValue = cleanUpString(newValue);
            if (data && newValue !== lineItem.name) {
              const existingItems = data.lineItemsNames.filter(
                (i) => i.name === newValue,
              );
              if (existingItems.length > 0) {
                newPrice = existingItems[0].price;
                setPrice((newPrice / 100).toString());
              }
            }

            onChange({ ...lineItem, name: newValue, price: newPrice });
          }}
          freeSolo
          renderInput={(params) => (
            <TextField
              {...params}
              label="Paslaugos ar prekės pavadinimas"
              inputProps={{
                'aria-label': 'Paslaugos pavadinimas' + lid,
                ...params.inputProps,
              }}
            />
          )}
        />
      </Grid>

      <Grid item xs={3}>
        <Autocomplete
          options={['vnt.', 'kg', 'val.']}
          fullWidth
          disabled={disabled}
          value={lineItem.unit}
          onInputChange={(_e, newValue) => {
            onChange({ ...lineItem, unit: newValue });
          }}
          freeSolo
          renderInput={(params) => (
            <TextField
              {...params}
              label="Matas"
              inputProps={{ 'aria-label': 'Matas' + lid, ...params.inputProps }}
            />
          )}
        />
      </Grid>

      <Grid item xs={3}>
        <TextField
          type="number"
          label="Kiekis"
          inputProps={{ 'aria-label': 'Kiekis' + lid }}
          value={amount}
          disabled={disabled}
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

      <Grid item xs={3}>
        <TextField
          type="number"
          label="Kaina"
          inputProps={{ 'aria-label': 'Kaina' + lid }}
          value={price}
          disabled={disabled}
          onChange={(e) => {
            let price = Math.round(parseFloat(e.target.value) * 100);
            if (price <= 0) {
              price = 1;
              setPrice('0.01');
            } else if (price > 100000000) {
              price = 100000000;
              setPrice((price / 100).toString());
            } else {
              setPrice(e.target.value);
            }
            onChange({
              ...lineItem,
              price: price || 0,
            });
          }}
          fullWidth
          InputProps={{
            endAdornment: <InputAdornment position="end">€</InputAdornment>,
          }}
        />
      </Grid>

      <Grid item xs={3}>
        <TextField
          type="number"
          label="Viso"
          disabled
          value={
            !isNaN(parseFloat(price)) && !isNaN(parseInt(amount, 10))
              ? parseFloat(price) * parseInt(amount, 10)
              : '-'
          }
          fullWidth
          InputProps={{
            endAdornment: <InputAdornment position="end">€</InputAdornment>,
          }}
        />
      </Grid>

      {deleteEnabled && (
        <Grid item xs={3}>
          <Button
            color="secondary"
            startIcon={<ClearIcon />}
            onClick={onDelete}
            aria-label={'Pašalinti' + lid}
            disabled={disabled}
          >
            Pašalinti
          </Button>
        </Grid>
      )}
    </>
  );
}
