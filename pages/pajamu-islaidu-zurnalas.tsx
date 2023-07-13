import { useState } from 'react';
import Grid from '@mui/material/Grid';
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  Link,
  TextField,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { useSession } from 'next-auth/react';

import { getMsSinceEpoch } from '../utils/date';
import useSWR from 'swr';
import { useRecoilState } from 'recoil';
import { messageTextState, messageSeverityState } from '../src/atoms';

export default function Index() {
  const { data: session } = useSession();
  const [, setMessageText] = useRecoilState(messageTextState);
  const [, setMessageSeverity] = useRecoilState(messageSeverityState);

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

  const { data } = useSWR(
    session &&
      `/api/journal?from=${getMsSinceEpoch(fromDate)}&to=${getMsSinceEpoch(
        toDate,
      )}`,
  );

  if (!session) {
    return null;
  }

  const generatePdf = async () => {
    let response: Response;
    try {
      response = await fetch('/api/journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          journal: data.journal,
          personalInfo,
          location,
          activityName,
          includeExpenses,
        }),
      });
    } catch {}

    if (!response || !response.ok) {
      setMessageText('Įvyko klaida generuojant pajamų-išlaidų žurnalą.');
      setMessageSeverity('error');
      return;
    }

    const file = new Blob([await response.blob()], { type: 'application/pdf' });
    const fileURL = URL.createObjectURL(file);

    window.open(fileURL, '_blank');
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
          Laikotarpis
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
        <Button
          variant="text"
          onClick={() => {
            setFromDate(startOfThisYear());
            setToDate(endOfThisYear());
          }}
          size="small"
        >
          Šie metai
        </Button>
      </Grid>
      <Grid item xs={3}>
        <Button
          variant="text"
          onClick={() => {
            const start = new Date();
            start.setUTCHours(0, 0, 0, 0);
            start.setMonth(0);
            start.setDate(1);
            start.setFullYear(start.getFullYear() - 1);
            setFromDate(start);

            const end = new Date();
            end.setUTCHours(0, 0, 0, 0);
            end.setMonth(0);
            end.setDate(31);
            end.setMonth(end.getMonth() + 11);
            end.setFullYear(end.getFullYear() - 1);
            setToDate(end);
          }}
          size="small"
        >
          Praeiti metai
        </Button>
      </Grid>
      <Grid item xs={6}></Grid>

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
        <Button
          variant="contained"
          disabled={!data?.journal.length}
          onClick={generatePdf}
          size="small"
        >
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

function startOfThisYear() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setMonth(0);
  d.setDate(1);
  return d;
}

function endOfThisYear() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setMonth(0);
  d.setDate(31);
  d.setMonth(d.getMonth() + 11);
  return d;
}
