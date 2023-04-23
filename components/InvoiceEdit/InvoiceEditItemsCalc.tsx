import { useEffect, useMemo, useState } from 'react';
import { useRecoilState } from 'recoil';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { InputAdornment } from '@mui/material';
import useSWR from 'swr';

import { alreadyPaidState, lineItemsState } from '../../src/atoms';

export default function InvoiceEditItems() {
  const [lineItems] = useRecoilState(lineItemsState);
  const [alreadyPaid, setAlreadyPaid] = useRecoilState(alreadyPaidState);
  const [alreadyPaidInner, setAlreadyPaidInner] = useState('0');

  const { data: vatpayerData } = useSWR('/api/settings/vatpayer');
  const isVatPayer = vatpayerData?.value === '1';

  useEffect(() => {
    setAlreadyPaidInner((alreadyPaid / 100).toString());
  }, [alreadyPaid]);

  const total = useMemo(
    () => lineItems.map((i) => i.price * i.amount).reduce((p, c) => p + c, 0),
    [lineItems],
  );

  const total_without_vat = useMemo(() => {
    if (isVatPayer) {
      return lineItems
        .map((i) => Math.round(i.price / (1.0 + i.vat / 100)) * i.amount)
        .reduce((p, c) => p + c, 0);
    }
  }, [isVatPayer, lineItems]);

  return (
    <>
      <Grid container item xs={12} justifyContent="flex-end">
        <TextField
          variant="standard"
          type="number"
          label="Iš viso"
          inputProps={{ 'aria-label': 'Iš viso' }}
          value={total / 100}
          InputProps={{
            endAdornment: <InputAdornment position="end">€</InputAdornment>,
            readOnly: true,
          }}
        />
      </Grid>

      {isVatPayer && (
        <Grid container item xs={12} justifyContent="flex-end">
          <TextField
            variant="standard"
            type="number"
            label="Iš viso be PVM"
            inputProps={{ 'aria-label': 'Iš viso' }}
            value={total_without_vat / 100}
            InputProps={{
              endAdornment: <InputAdornment position="end">€</InputAdornment>,
              readOnly: true,
            }}
          />
        </Grid>
      )}

      <Grid container item xs={12} justifyContent="flex-end">
        <TextField
          variant="standard"
          type="number"
          label="Jau apmokėta"
          inputProps={{ 'aria-label': 'Jau apmokėta' }}
          value={alreadyPaidInner}
          onChange={(e) => {
            setAlreadyPaidInner(e.target.value);
            if (!isNaN(parseFloat(e.target.value))) {
              const floored = Math.floor(parseFloat(e.target.value) * 100);
              setAlreadyPaid(floored);
              setAlreadyPaidInner((floored / 100).toString());
            }
          }}
          InputProps={{
            endAdornment: <InputAdornment position="end">€</InputAdornment>,
          }}
          error={alreadyPaid > total}
          helperText={
            alreadyPaid > total
              ? 'Sumokėta dalis turi būti mažesnė negu visa suma.'
              : ''
          }
        />
      </Grid>
      <Grid container item xs={12} justifyContent="flex-end">
        <Typography variant="body1">
          Liko mokėti: {(total - alreadyPaid) / 100}€
        </Typography>
      </Grid>
    </>
  );
}
