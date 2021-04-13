import React, { useState } from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import { Typography } from '@material-ui/core';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import { KeyboardDatePicker } from '@material-ui/pickers';
import AddIcon from '@material-ui/icons/Add';
import { useSession } from 'next-auth/client';
import { useRouter } from 'next/router';
import { useDebounce } from 'react-recipes';

import Invoices from '../../components/Invoices';
import BuyerInput from '../../components/BuyerInput';
import SeriesNameInput from '../../components/SeriesNameInput';
import { getMsSinceEpoch } from '../../utils/date';

export default function Index() {
  const [session] = useSession();
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
        <KeyboardDatePicker
          label="Minimali data"
          autoOk={true}
          inputProps={{ 'aria-label': 'Maksimali data' }}
          value={minDate}
          onChange={setMinDate}
          format="yyyy-MM-dd"
          fullWidth
          invalidDateMessage={'Neteisingas datos formatas'}
          okLabel="Gerai"
          cancelLabel="Nutraukti"
        />
      </Grid>
      <Grid item xs={6}>
        <KeyboardDatePicker
          label="Maksimali data"
          autoOk={true}
          inputProps={{ 'aria-label': 'Maksimali data' }}
          value={maxDate}
          onChange={setMaxDate}
          format="yyyy-MM-dd"
          fullWidth
          invalidDateMessage={'Neteisingas datos formatas'}
          okLabel="Gerai"
          cancelLabel="Nutraukti"
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
        <FormControl component="fieldset">
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
