import { useEffect, useMemo, useState } from 'react';
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
import StatsGraph from '../components/StatsGraph';
import useSWR from 'swr';
import SeriesNameInput from '../components/inputs/SeriesNameInput';
import { DefaultDates } from '../components/inputs/DefaultDates';

const MMA_BY_YEAR = {
  2021: 642,
  2022: 730,
  2023: 840,
};

export default function Index() {
  const { data: session } = useSession();

  const [fromDate, setFromDate] = useState(() => {
    let d = new Date();
    let today = d.getDate();
    d.setUTCHours(0, 0, 0, 0);
    d.setDate(1);
    d.setMonth(d.getMonth() - (today <= 10 ? 12 : 11));
    return d;
  });
  const [toDate, setToDate] = useState(() => {
    return new Date();
  });

  const [income, setIncome] = useState('0');
  const [expense, setExpense] = useState('0');
  const [vat, setVat] = useState('0');
  const [insured, setInsured] = useState(true);
  const [additionalPension, setAdditionalPension] = useState(true);
  const [seriesName, setSeriesName] = useState('');

  const { data: vatpayerData } = useSWR(session && '/api/settings/vatpayer');
  const isVatPayer = vatpayerData?.value === '1';

  const { data } = useSWR(
    session &&
      `/api/stats?from=${getMsSinceEpoch(fromDate)}&to=${getMsSinceEpoch(
        toDate,
      )}&seriesName=${seriesName}`,
  );

  const { data: expdata } = useSWR(
    session &&
      `/api/expstats?from=${getMsSinceEpoch(fromDate)}&to=${getMsSinceEpoch(
        toDate,
      )}`,
  );

  const totalIncome = useMemo(
    () =>
      data &&
      data.stats.reduce((c, i) => {
        return c + (i.flags === 0 ? i.total : i.flags === 2 ? -i.total : 0);
      }, 0) / 100,
    [data],
  );

  useEffect(() => {
    if (totalIncome) {
      setIncome(totalIncome.toString());
    }
  }, [totalIncome]);

  useEffect(() => {
    setExpense(
      Math.max(parseFloat(income) * 0.3, expdata?.stats.total || 0).toFixed(2),
    );
  }, [income, expdata]);

  const totalVat = useMemo(
    () =>
      data &&
      data.stats.reduce((c, i) => {
        return (
          c +
          (i.flags === 0 && i.vat ? i.vat : i.flags === 2 && i.vat ? -i.vat : 0)
        );
      }, 0) / 100,
    [data],
  );

  useEffect(() => {
    setVat(isVatPayer && totalVat ? totalVat.toFixed(2) : '0');
  }, [isVatPayer, totalVat]);

  const { profit, gpm, sodros_baze, vsd, psd, total_tax, profit_after_taxes } =
    useMemo(() => {
      const profit = Math.max(
        parseFloat(income) - parseFloat(expense) - parseFloat(vat),
        0,
      );

      const gpm =
        profit < 20_000
          ? profit * 0.05
          : profit > 35_000
            ? profit * 0.15
            : profit * 0.15 -
              profit * (0.1 - (2 / 300_000) * (profit - 20_000));

      const sodros_baze = profit * 0.9;

      const vsd = (sodros_baze * (12.52 + (additionalPension ? 3 : 0))) / 100;

      let psd_from_income = (sodros_baze * 6.98) / 100;

      let psd = psd_from_income;
      if (!insured) {
        const d = new Date(fromDate);
        let minimal_psd = 0;
        while (d < toDate) {
          minimal_psd += ((MMA_BY_YEAR[d.getFullYear()] || 840) * 6.98) / 100;
          d.setMonth(d.getMonth() + 1);
        }
        psd = Math.max(minimal_psd, psd_from_income);
      }

      const total_tax = gpm + vsd + psd + (parseFloat(vat) || 0);
      const profit_after_taxes = profit - (total_tax - parseFloat(vat));

      return {
        profit,
        gpm,
        sodros_baze,
        vsd,
        psd,
        total_tax,
        profit_after_taxes,
      };
    }, [additionalPension, expense, fromDate, income, insured, toDate, vat]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h5" component="h1">
          Individualios Veiklos mokesčių skaičiuoklė
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

      <DefaultDates setFromDate={setFromDate} setToDate={setToDate} />

      <Grid item xs={12}>
        <SeriesNameInput
          seriesName={seriesName}
          onChange={setSeriesName}
          disabled={false}
          invoiceType={'standard'}
        />
      </Grid>

      {session && (
        <>
          <Grid item xs={12}>
            <Typography variant="h6" component="h1">
              Pajamų grafikas
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <StatsGraph
              data={data}
              fromDate={getMsSinceEpoch(fromDate)}
              toDate={getMsSinceEpoch(toDate)}
            />
          </Grid>
        </>
      )}
      <Grid item xs={12}>
        <Typography variant="h6" component="h1">
          Jūsų duomenys
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="body1" component="div">
          Ši mokesčių skaičiuoklė turėtų padėti apsiskaičiuoti kiek daugiausia
          mokesčių gali tekti susimokėti. Ji nepadengia visų įmanomų mokestinių
          lengvatų ir jei jos jums aktualios siūlau naudotis:{' '}
          <Link
            color="inherit"
            href="https://www.sodra.lt/lt/skaiciuokles/individualios_veiklos_skaiciuokle"
            underline="always"
          >
            Sodros Individualios Veiklos skaičiuokle
          </Link>
          .{' '}
          {session &&
            'Galite naudoti tiek duomenis, kuriuos įvedėte haiku.lt, tiek hipotetinius, kuriuos susigalvojote.'}
        </Typography>
      </Grid>

      <Grid item xs={4}>
        <TextField
          variant="standard"
          inputProps={{ 'aria-label': 'Pajamos' }}
          label="Pajamos"
          value={income}
          onChange={(e) => {
            setIncome(e.target.value);
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={8}>
        {totalIncome !== undefined && (
          <>
            <Typography variant="body1" component="div">
              Jūsų pajamos pagal SF: {totalIncome}
            </Typography>
            <Button
              variant="text"
              onClick={() => setIncome(totalIncome.toString())}
              size="small"
            >
              Naudoti
            </Button>
          </>
        )}
      </Grid>

      <Grid item xs={4}>
        <TextField
          variant="standard"
          inputProps={{ 'aria-label': 'Išlaidos' }}
          label="Išlaidos"
          value={expense}
          onChange={(e) => {
            setExpense(e.target.value);
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={4}>
        <Typography variant="body1" component="div">
          30% nuo pajamų: {(parseFloat(income) * 0.3).toFixed(2)}
        </Typography>
        <Button
          variant="text"
          onClick={() => setExpense((parseFloat(income) * 0.3).toFixed(2))}
          size="small"
        >
          Naudoti
        </Button>
      </Grid>
      <Grid item xs={4}>
        {expdata?.stats?.total !== undefined && (
          <>
            <Typography variant="body1" component="div">
              Jūsų išlaidos: {expdata.stats.total}
            </Typography>
            <Button
              variant="text"
              onClick={() => setExpense(expdata.stats.total.toString())}
              size="small"
            >
              Naudoti
            </Button>
          </>
        )}
      </Grid>

      {!isVatPayer && (
        <Grid item xs={12}>
          <Typography variant="body1" component="div">
            Čia galite pasižiūrėti, kas būtų, jei jums reiktų mokėti PVM.
            Prievolė registruotis PVM mokėtoju atsiranda gavus pajamų virš
            45000€ per metus arba įsigijus prekių iš kitos ES šalies už daugiau
            nei 14000€.
          </Typography>
        </Grid>
      )}
      <Grid item xs={4}>
        <TextField
          variant="standard"
          inputProps={{ 'aria-label': 'PVM' }}
          label="PVM"
          value={vat}
          onChange={(e) => {
            setVat(e.target.value);
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={4}>
        <Typography variant="body1" component="div">
          21% PVM nuo pajamų:{' '}
          {(parseFloat(income) * (1.0 - 1.0 / 1.21)).toFixed(2)}
        </Typography>
        <Button
          variant="text"
          onClick={() =>
            setVat((parseFloat(income) * (1.0 - 1.0 / 1.21)).toFixed(2))
          }
          size="small"
        >
          Naudoti
        </Button>
      </Grid>
      <Grid item xs={4}>
        {totalVat !== undefined && isVatPayer && (
          <>
            <Typography variant="body1" component="div">
              PVM pagal SF: {totalVat.toFixed(2)}
            </Typography>
            <Button
              variant="text"
              onClick={() => setVat(totalVat.toFixed(2))}
              size="small"
            >
              Naudoti
            </Button>
          </>
        )}
      </Grid>

      <Grid item xs={12}>
        <FormControl variant="standard">
          <FormControlLabel
            control={
              <Checkbox
                checked={insured}
                onChange={(event) => setInsured(event.target.checked)}
                name="sent"
                color="primary"
              />
            }
            label={'Ar esate draustas privalomu sveikatos draudimu?'}
          />
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <FormControl variant="standard">
          <FormControlLabel
            control={
              <Checkbox
                checked={additionalPension}
                onChange={(event) => setAdditionalPension(event.target.checked)}
                name="sent"
                color="primary"
              />
            }
            label={'Ar kaupiate papildomai pensijai?'}
          />
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h6" component="h1">
          Mokesčių skaičiavimai
        </Typography>
      </Grid>

      <Grid item xs={6}>
        <Typography variant="body1" component="div">
          <strong>Apmokestinamas pelnas: </strong>
        </Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography variant="body1" component="div">
          {profit.toFixed(2)} €
        </Typography>
      </Grid>

      <Grid item xs={6}>
        <Typography variant="body1" component="div">
          <strong>Sodros bazė: </strong>
        </Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography variant="body1" component="div">
          {sodros_baze.toFixed(2)} €
        </Typography>
      </Grid>

      <Grid item xs={6}>
        <Typography variant="body1" component="div">
          <strong>GPM: </strong>
        </Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography variant="body1" component="div">
          {gpm.toFixed(2)} €
        </Typography>
      </Grid>

      <Grid item xs={6}>
        <Typography variant="body1" component="div">
          <strong>VSD: </strong>
        </Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography variant="body1" component="div">
          {vsd.toFixed(2)} €
        </Typography>
      </Grid>

      <Grid item xs={6}>
        <Typography variant="body1" component="div">
          <strong>PSD: </strong>
        </Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography variant="body1" component="div">
          {psd.toFixed(2)} €
        </Typography>
      </Grid>

      {parseFloat(vat) !== 0 && (
        <>
          <Grid item xs={6}>
            <Typography variant="body1" component="div">
              <strong>PVM:</strong>
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" component="div">
              {parseFloat(vat).toFixed(2)} €
            </Typography>
          </Grid>
        </>
      )}

      <Grid item xs={6}>
        <Typography variant="body1" component="div">
          <strong>Viso mokesčių: </strong>
        </Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography variant="body1" component="div">
          {total_tax.toFixed(2)} €
        </Typography>
      </Grid>

      <Grid item xs={6}>
        <Typography variant="body1" component="div">
          <strong>Pelnas po mokesčių: </strong>
        </Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography variant="body1" component="div">
          {profit_after_taxes.toFixed(2)} €
        </Typography>
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
                href="https://www.sodra.lt/lt/skaiciuokles/individualios_veiklos_skaiciuokle"
                underline="always"
              >
                Sodros Individualios Veiklos skaičiuoklė
              </Link>
            </li>
            <li>
              <Link
                color="inherit"
                href="https://www.sodra.lt/lt/situacijos/imoku-tarifai-savarankiskai-dirbantiems"
                underline="always"
              >
                Įmoku tarifai savarankiškai dirbantiems
              </Link>
            </li>
            <li>
              <Link
                color="inherit"
                href="https://www.vmi.lt/evmi/documents/20142/391017/Individualios+veiklos+apmokestinimo+tavrka+nuo+2018-01-01+%C4%AF+nauj%C4%85+KMK.pdf/35dee9e6-df89-da04-265d-60b67b404657?t=1543400149072"
                underline="always"
              >
                GPM skaičiavimas
              </Link>
            </li>
          </ul>
        </Typography>
      </Grid>
    </Grid>
  );
}
