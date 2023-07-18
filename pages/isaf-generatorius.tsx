import { useEffect, useState } from 'react';
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
import { useRouter } from 'next/router';
import SeriesNameInput from '../components/inputs/SeriesNameInput';
import useSWR from 'swr';

export default function Index() {
  const { data: session } = useSession();
  const router = useRouter();

  const settingApiUrl = `/api/settings/seller`;
  const { data: sellerData } = useSWR(session && settingApiUrl);

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

  const [seriesName, setSeriesName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');

  useEffect(() => {
    const regno = sellerData?.value?.match(/Ind.* ([0-9]+)/i);
    if (regno) {
      setRegistrationNumber(regno[1]);
    }
  }, [sellerData]);

  if (!session) {
    return null;
  }

  const generateISAF = async () => {
    const args = {
      from: getMsSinceEpoch(fromDate).toString(),
      to: getMsSinceEpoch(toDate).toString(),
      registrationNumber,
      seriesName,
    };

    const params = new URLSearchParams(args);
    router.push('/api/isafxml?' + params.toString());
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h5" component="h1">
          i.SAF generatorius
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body1" component="div">
          i.SAF generatorius nėra visiškai išbaigtas. Šiuo metu jis tinkamas tik
          generuoti sąskaitų faktūrų i.SAF XML failui (išlaidų i.SAF nėra
          generuojamas). Taip pat šis įrankis šiuo metu daro prielaidą, kad SF
          išrašomos Lietuvoje. Jeigu jūs SF išrašote pirkėjams iš kitų šalių ir
          jums reikia i.SAF, susisiekite su manimi - pažiūrėsime, ką galime
          padaryti.
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
      <Grid item xs={3}>
        <Button
          variant="text"
          onClick={() => {
            const start = new Date();
            start.setUTCHours(0, 0, 0, 0);
            start.setDate(1);
            setFromDate(start);

            const end = new Date();
            end.setUTCHours(0, 0, 0, 0);
            end.setMonth(end.getMonth() + 1);
            end.setDate(1);
            end.setDate(end.getDate() - 1);
            setToDate(end);
          }}
          size="small"
        >
          Šis mėnuo
        </Button>
      </Grid>
      <Grid item xs={3}>
        <Button
          variant="text"
          onClick={() => {
            const start = new Date();
            start.setUTCHours(0, 0, 0, 0);
            start.setDate(1);
            start.setMonth(start.getMonth() - 1);
            setFromDate(start);

            const end = new Date();
            end.setUTCHours(0, 0, 0, 0);
            end.setDate(1);
            end.setDate(end.getDate() - 1);
            setToDate(end);
          }}
          size="small"
        >
          Praeitas mėnuo
        </Button>
      </Grid>

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
            'aria-label': 'Individualios veiklos pažymėjimo numeris',
          }}
          label="Individualios veiklos pažymėjimo numeris"
          value={registrationNumber}
          onChange={(e) => {
            setRegistrationNumber(e.target.value);
          }}
          fullWidth
        />
      </Grid>

      <Grid item xs={4}>
        <Button variant="contained" onClick={generateISAF} size="small">
          Generuoti i.SAF XML
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
                href="https://www.vmi.lt/evmi/documents/20142/391113/i.SAF+duomen%C5%B3+rinkmenos+XML+strukturos+apraso+aprasymas+%281.2.1%29.pdf/e022f941-29e7-7f9a-9a93-63d3cf72b294?t=1545213233801"
                underline="always"
              >
                Informacija apie i.SAF XML formatą
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
