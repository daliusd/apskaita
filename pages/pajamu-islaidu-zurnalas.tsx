import { useState } from 'react';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { DatePicker } from '@mui/x-date-pickers';
import { useSession } from 'next-auth/react';

import { getMsSinceEpoch } from '../utils/date';
import { useRouter } from 'next/router';
import SeriesNameInput from '../components/inputs/SeriesNameInput';
import { DateButtonThisYear } from '../components/inputs/DateButtonThisYear';
import { DateButtonPreviousYear } from '../components/inputs/DateButtonPreviousYear';

export default function Index() {
  const { data: session } = useSession();
  const router = useRouter();

  const [fromDate, setFromDate] = useState(() => {
    let d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    d.setMonth(0);
    d.setDate(1);
    return d;
  });
  const [toDate, setToDate] = useState(() => {
    let d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    d.setMonth(11);
    d.setDate(31);
    return d;
  });

  const [personalInfo, setPersonalInfo] = useState('');
  const [location, setLocation] = useState('');
  const [activityName, setActivityName] = useState('');
  const [includeExpenses, setIncludeExpenses] = useState(false);
  const [seriesName, setSeriesName] = useState('');

  if (!session) {
    return null;
  }

  const generatePdf = async () => {
    const args = {
      from: getMsSinceEpoch(fromDate).toString(),
      to: getMsSinceEpoch(toDate).toString(),
      includeExpenses: includeExpenses.toString(),
      seriesName,
      personalInfo,
      location,
      activityName,
    };

    const params = new URLSearchParams(args);
    router.push('/api/journal?' + params.toString());
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h5" component="h1">
          Pajamų Ir Išlaidų Apskaitos Žurnalo Generatorius
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6" component="h1">
          Laikotarpis ir Serija
        </Typography>
      </Grid>

      <Grid item xs={6}>
        <DatePicker
          label="Pradžios data"
          value={fromDate}
          onChange={setFromDate}
          format="yyyy-MM-dd"
          slotProps={{
            textField: {
              fullWidth: true,
              inputProps: {
                'aria-label': 'Pradžios data',
              },
              variant: 'standard',
            },
          }}
        />
      </Grid>
      <Grid item xs={6}>
        <DatePicker
          label="Pabaigos data"
          value={toDate}
          onChange={setToDate}
          format="yyyy-MM-dd"
          slotProps={{
            textField: {
              fullWidth: true,
              inputProps: {
                'aria-label': 'Pabaigos data',
              },
              variant: 'standard',
            },
          }}
        />
      </Grid>
      <Grid item xs={3}>
        <DateButtonThisYear setFromDate={setFromDate} setToDate={setToDate} />
      </Grid>
      <Grid item xs={3}>
        <DateButtonPreviousYear
          setFromDate={setFromDate}
          setToDate={setToDate}
        />
      </Grid>
      <Grid item xs={6}></Grid>
      <Grid item xs={12}>
        <SeriesNameInput
          seriesName={seriesName}
          onChange={setSeriesName}
          disabled={false}
          invoiceType={'standard'}
        />
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h6" component="h1">
          Jūsų duomenys
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <TextField
          variant="standard"
          inputProps={{
            'aria-label': 'Gyventojo vardas, pavardė, asmens kodas',
          }}
          label="Gyventojo vardas, pavardė, asmens kodas"
          value={personalInfo}
          onChange={(e) => {
            setPersonalInfo(e.target.value);
          }}
          fullWidth
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          variant="standard"
          inputProps={{ 'aria-label': 'Gyvenamoji vieta' }}
          label="Gyvenamoji vieta"
          value={location}
          onChange={(e) => {
            setLocation(e.target.value);
          }}
          fullWidth
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          variant="standard"
          inputProps={{ 'aria-label': 'Veiklos pavadinimas' }}
          label="Veiklos pavadinimas"
          value={activityName}
          onChange={(e) => {
            setActivityName(e.target.value);
          }}
          fullWidth
        />
      </Grid>

      <Grid item xs={12}>
        <FormControl variant="standard">
          <FormControlLabel
            control={
              <Checkbox
                checked={includeExpenses}
                onChange={(event) => setIncludeExpenses(event.target.checked)}
                name="sent"
                color="primary"
              />
            }
            label={
              'Ar įtraukti išlaidas į žurnalą? Jeigu deklaruojate, kad išlaidos sudaro 30% pajamų, išlaidų įtraukti nereikia.'
            }
          />
        </FormControl>
      </Grid>

      <Grid item xs={4}>
        <Button variant="contained" onClick={generatePdf} size="small">
          Generuoti žurnalą
        </Button>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h6" component="h1">
          Naudingos nuorodos
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body1" component="div">
          <ul>
            <li>
              <Link
                color="inherit"
                href="https://www.e-tar.lt/portal/lt/legalAct/TAR.1C8F1B983D57"
                underline="always"
              >
                Informacija apie gyventojų pajamų ir išlaidų apskaitos žurnalo
                vedimą.
              </Link>
            </li>
          </ul>
        </Typography>
      </Grid>
    </Grid>
  );
}
