import { useEffect, useMemo, useState } from 'react';
import { useRecoilState } from 'recoil';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { InputAdornment } from '@mui/material';
import useSWR from 'swr';

import { alreadyPaidState, lineItemsState, vatState } from '../../src/atoms';

export default function InvoiceEditItems() {
  const [lineItems] = useRecoilState(lineItemsState);
  const [alreadyPaid, setAlreadyPaid] = useRecoilState(alreadyPaidState);
  const [alreadyPaidInner, setAlreadyPaidInner] = useState('0');

  const [vat, setVat] = useRecoilState(vatState);
  const [vatInner, setVatInner] = useState('0');

  const { data: vatpayerData } = useSWR('/api/settings/vatpayer');

  useEffect(() => {
    setAlreadyPaidInner((alreadyPaid / 100).toString());
  }, [alreadyPaid]);

  useEffect(() => {
    setVatInner(vat.toString());
  }, [vat]);

  const total = useMemo(
    () => lineItems.map((i) => i.price * i.amount).reduce((p, c) => p + c, 0),
    [lineItems],
  );

  const total_without_vat = Math.round(total / (1.0 + vat / 100));

  if (total === 0) return null;

  return (
    <>
      <Grid container item xs={12} justifyContent="flex-end">
        <Typography variant="body1">Iš viso: {total / 100}€</Typography>
      </Grid>

      {vatpayerData?.value === '1' && (
        <Grid container item xs={12} justifyContent="flex-end">
          <TextField
            variant="standard"
            type="number"
            label="PVM"
            inputProps={{ 'aria-label': 'PVM' }}
            value={vatInner}
            onChange={(e) => {
              setVatInner(e.target.value);
              if (!isNaN(parseFloat(e.target.value))) {
                const val = parseFloat(e.target.value);
                setVat(val);
                setVatInner(val.toString());
              }
            }}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            }}
          />
        </Grid>
      )}
      {vatpayerData?.value === '1' && vat > 0 && (
        <>
          <Grid container item xs={12} justifyContent="flex-end">
            <Typography variant="body1">
              Iš viso be PVM: {total_without_vat / 100}€
            </Typography>
          </Grid>
          <Grid container item xs={12} justifyContent="flex-end">
            <Typography variant="body1">
              PVM: {(total - total_without_vat) / 100}€
            </Typography>
          </Grid>
        </>
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
