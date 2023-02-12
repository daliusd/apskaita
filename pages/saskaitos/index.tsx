import React, { useState } from 'react';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { TextField, Typography } from '@mui/material';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { DatePicker } from '@mui/x-date-pickers';
import AddIcon from '@mui/icons-material/Add';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useDebounce } from 'react-recipes';

import Invoices from '../../components/Invoices';
import BuyerInput from '../../components/inputs/BuyerInput';
import SeriesNameInput from '../../components/inputs/SeriesNameInput';
import { getMsSinceEpoch } from '../../utils/date';

export default function Index() {
  const { data: session } = useSession();
  const router = useRouter();

  const [minDate, setMinDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d;
  });
  const [maxDate, setMaxDate] = useState(() => new Date());
  const [buyer, setBuyer] = useState('');
  const [seriesName, setSeriesName] = useState('');
  const [paid, setPaid] = React.useState('all');

  const debouncedSeriesName = useDebounce(seriesName, 500);
  const debouncedBuyer = useDebounce(buyer, 500);

  if (!session) {
    return null;
  }

  const onClickCreateInvoice = () => {
    router.push('/saskaitos/nauja');
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Button
          aria-label="Nauja sąskaita faktūra"
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={onClickCreateInvoice}
        >
          Nauja sąskaita faktūra
        </Button>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6" component="h1">
          Filtrai
        </Typography>
      </Grid>

      <Grid item xs={6}>
        <DatePicker
          label="Minimali data"
          value={minDate}
          onChange={setMinDate}
          inputFormat="yyyy-MM-dd"
          renderInput={(params) => (
            <TextField
              fullWidth
              {...params}
              inputProps={{
                'aria-label': 'Minimali data',
                ...params.inputProps,
              }}
              variant="standard"
            />
          )}
        />
      </Grid>
      <Grid item xs={6}>
        <DatePicker
          label="Maksimali data"
          value={maxDate}
          onChange={setMaxDate}
          inputFormat="yyyy-MM-dd"
          renderInput={(params) => (
            <TextField
              fullWidth
              {...params}
              inputProps={{
                'aria-label': 'Maksimali data',
                ...params.inputProps,
              }}
              variant="standard"
            />
          )}
        />
      </Grid>

      <Grid item xs={12}>
        <SeriesNameInput
          seriesName={seriesName}
          onChange={setSeriesName}
          disabled={false}
        />
      </Grid>

      <Grid item xs={12}>
        <BuyerInput
          buyer={buyer}
          onChange={(bi) => setBuyer(bi.buyer)}
          rows={1}
          disabled={false}
        />
      </Grid>

      <Grid item xs={12}>
        <FormControl variant="standard" component="fieldset">
          <FormLabel component="legend">Apmokėjimas</FormLabel>
          <RadioGroup
            aria-label="Apmokėjimas"
            name="paidStatus"
            value={paid}
            onChange={(e) => setPaid(e.target.value)}
            row
          >
            <FormControlLabel value="all" control={<Radio />} label="Visos" />
            <FormControlLabel
              value="paid"
              control={<Radio />}
              label="Apmokėtos"
            />
            <FormControlLabel
              value="unpaid"
              control={<Radio />}
              label="Neapmokėtos"
            />
          </RadioGroup>
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h6" component="h1">
          Sąskaitos faktūros
        </Typography>
      </Grid>

      <Invoices
        minDate={getMsSinceEpoch(minDate)}
        maxDate={getMsSinceEpoch(maxDate)}
        seriesName={debouncedSeriesName}
        buyer={debouncedBuyer}
        paid={paid === 'paid' ? true : paid === 'unpaid' ? false : undefined}
      />
    </Grid>
  );
}
