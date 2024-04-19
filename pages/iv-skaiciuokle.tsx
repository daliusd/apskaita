import { useEffect, useMemo, useState } from 'react';
import {
  Anchor,
  Button,
  Checkbox,
  Grid,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
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
    <Grid gutter={{ base: 12 }}>
      <Grid.Col span={12}>
        <Title order={2}>Individualios Veiklos mokesčių skaičiuoklė</Title>
      </Grid.Col>
      <Grid.Col span={12}>
        <Title order={3}>Laikotarpis ir Serija</Title>
      </Grid.Col>

      <Grid.Col span={6}>
        <DateInput
          label="Minimali data"
          aria-label="Minimali data"
          value={fromDate}
          onChange={setFromDate}
          valueFormat="YYYY-MM-DD"
        />
      </Grid.Col>
      <Grid.Col span={6}>
        <DateInput
          label="Pabaigos data"
          aria-label="Pabaigos data"
          value={toDate}
          onChange={setToDate}
          valueFormat="YYYY-MM-DD"
        />
      </Grid.Col>

      <DefaultDates setFromDate={setFromDate} setToDate={setToDate} />

      <Grid.Col span={12}>
        <SeriesNameInput
          seriesName={seriesName}
          onChange={setSeriesName}
          disabled={false}
          invoiceType={'standard'}
        />
      </Grid.Col>

      {session && (
        <>
          <Grid.Col span={12}>
            <Title order={3}>Pajamų grafikas</Title>
          </Grid.Col>
          <Grid.Col span={12}>
            <StatsGraph
              data={data}
              fromDate={getMsSinceEpoch(fromDate)}
              toDate={getMsSinceEpoch(toDate)}
            />
          </Grid.Col>
        </>
      )}
      <Grid.Col span={12}>
        <Title order={3}>Jūsų duomenys</Title>
      </Grid.Col>

      <Grid.Col span={12}>
        <Text>
          Ši mokesčių skaičiuoklė turėtų padėti apsiskaičiuoti kiek daugiausia
          mokesčių gali tekti susimokėti. Ji nepadengia visų įmanomų mokestinių
          lengvatų ir jei jos jums aktualios siūlau naudotis:{' '}
          <Anchor
            href="https://www.sodra.lt/lt/skaiciuokles/individualios_veiklos_skaiciuokle"
            underline="always"
          >
            Sodros Individualios Veiklos skaičiuokle
          </Anchor>
          .{' '}
          {session &&
            'Galite naudoti tiek duomenis, kuriuos įvedėte haiku.lt, tiek hipotetinius, kuriuos susigalvojote.'}
        </Text>
      </Grid.Col>

      <Grid.Col span={4}>
        <TextInput
          aria-label={'Pajamos'}
          label="Pajamos"
          value={income}
          onChange={(e) => {
            setIncome(e.currentTarget.value);
          }}
        />
      </Grid.Col>
      <Grid.Col span={8}>
        {totalIncome !== undefined && (
          <>
            <Text>Jūsų pajamos pagal SF: {totalIncome}</Text>
            <Button
              variant="transparent"
              onClick={() => setIncome(totalIncome.toString())}
              size="small"
            >
              Naudoti
            </Button>
          </>
        )}
      </Grid.Col>

      <Grid.Col span={4}>
        <TextInput
          aria-label={'Išlaidos'}
          label="Išlaidos"
          value={expense}
          onChange={(e) => {
            setExpense(e.currentTarget.value);
          }}
        />
      </Grid.Col>
      <Grid.Col span={4}>
        <Text>30% nuo pajamų: {(parseFloat(income) * 0.3).toFixed(2)}</Text>
        <Button
          variant="transparent"
          onClick={() => setExpense((parseFloat(income) * 0.3).toFixed(2))}
          size="small"
        >
          Naudoti
        </Button>
      </Grid.Col>
      <Grid.Col span={4}>
        {expdata?.stats?.total !== undefined && (
          <>
            <Text>Jūsų išlaidos: {expdata.stats.total}</Text>
            <Button
              variant="transparent"
              onClick={() => setExpense(expdata.stats.total.toString())}
              size="small"
            >
              Naudoti
            </Button>
          </>
        )}
      </Grid.Col>

      {!isVatPayer && (
        <Grid.Col span={12}>
          <Text>
            Čia galite pasižiūrėti, kas būtų, jei jums reiktų mokėti PVM.
            Prievolė registruotis PVM mokėtoju atsiranda gavus pajamų virš
            45000€ per metus arba įsigijus prekių iš kitos ES šalies už daugiau
            nei 14000€.
          </Text>
        </Grid.Col>
      )}
      <Grid.Col span={4}>
        <TextInput
          aria-label={'PVM'}
          label="PVM"
          value={vat}
          onChange={(e) => {
            setVat(e.currentTarget.value);
          }}
        />
      </Grid.Col>
      <Grid.Col span={4}>
        <Text>
          21% PVM nuo pajamų:{' '}
          {(parseFloat(income) * (1.0 - 1.0 / 1.21)).toFixed(2)}
        </Text>
        <Button
          variant="transparent"
          onClick={() =>
            setVat((parseFloat(income) * (1.0 - 1.0 / 1.21)).toFixed(2))
          }
          size="small"
        >
          Naudoti
        </Button>
      </Grid.Col>
      <Grid.Col span={4}>
        {totalVat !== undefined && isVatPayer && (
          <>
            <Text>PVM pagal SF: {totalVat.toFixed(2)}</Text>
            <Button
              variant="text"
              onClick={() => setVat(totalVat.toFixed(2))}
              size="small"
            >
              Naudoti
            </Button>
          </>
        )}
      </Grid.Col>

      <Grid.Col span={12}>
        <Checkbox
          checked={insured}
          onChange={(event) => setInsured(event.target.checked)}
          name="sent"
          label={'Ar esate draustas privalomu sveikatos draudimu?'}
        />
      </Grid.Col>
      <Grid.Col span={12}>
        <Checkbox
          checked={additionalPension}
          onChange={(event) => setAdditionalPension(event.target.checked)}
          name="sent"
          label={'Ar kaupiate papildomai pensijai?'}
        />
      </Grid.Col>

      <Grid.Col span={12}>
        <Title order={3}>Mokesčių skaičiavimai</Title>
      </Grid.Col>

      <Grid.Col span={6}>
        <Text>
          <strong>Apmokestinamas pelnas: </strong>
        </Text>
      </Grid.Col>
      <Grid.Col span={6}>
        <Text>{profit.toFixed(2)} €</Text>
      </Grid.Col>

      <Grid.Col span={6}>
        <Text>
          <strong>Sodros bazė: </strong>
        </Text>
      </Grid.Col>
      <Grid.Col span={6}>
        <Text>{sodros_baze.toFixed(2)} €</Text>
      </Grid.Col>

      <Grid.Col span={6}>
        <Text>
          <strong>GPM: </strong>
        </Text>
      </Grid.Col>
      <Grid.Col span={6}>
        <Text>{gpm.toFixed(2)} €</Text>
      </Grid.Col>

      <Grid.Col span={6}>
        <Text>
          <strong>VSD: </strong>
        </Text>
      </Grid.Col>
      <Grid.Col span={6}>
        <Text>{vsd.toFixed(2)} €</Text>
      </Grid.Col>

      <Grid.Col span={6}>
        <Text>
          <strong>PSD: </strong>
        </Text>
      </Grid.Col>
      <Grid.Col span={6}>
        <Text>{psd.toFixed(2)} €</Text>
      </Grid.Col>

      {parseFloat(vat) !== 0 && (
        <>
          <Grid.Col span={6}>
            <Text>
              <strong>PVM:</strong>
            </Text>
          </Grid.Col>
          <Grid.Col span={6}>
            <Text>{parseFloat(vat).toFixed(2)} €</Text>
          </Grid.Col>
        </>
      )}

      <Grid.Col span={6}>
        <Text>
          <strong>Viso mokesčių: </strong>
        </Text>
      </Grid.Col>
      <Grid.Col span={6}>
        <Text>{total_tax.toFixed(2)} €</Text>
      </Grid.Col>

      <Grid.Col span={6}>
        <Text>
          <strong>Pelnas po mokesčių: </strong>
        </Text>
      </Grid.Col>
      <Grid.Col span={6}>
        <Text>{profit_after_taxes.toFixed(2)} €</Text>
      </Grid.Col>
      <Grid.Col span={12}>
        <Title order={3}>Naudingos nuorodos</Title>
      </Grid.Col>
      <Grid.Col span={12}>
        <ul>
          <li>
            <Anchor
              href="https://www.sodra.lt/lt/skaiciuokles/individualios_veiklos_skaiciuokle"
              underline="always"
            >
              Sodros Individualios Veiklos skaičiuoklė
            </Anchor>
          </li>
          <li>
            <Anchor
              href="https://www.sodra.lt/lt/situacijos/imoku-tarifai-savarankiskai-dirbantiems"
              underline="always"
            >
              Įmoku tarifai savarankiškai dirbantiems
            </Anchor>
          </li>
          <li>
            <Anchor
              href="https://www.vmi.lt/evmi/documents/20142/391017/Individualios+veiklos+apmokestinimo+tavrka+nuo+2018-01-01+%C4%AF+nauj%C4%85+KMK.pdf/35dee9e6-df89-da04-265d-60b67b404657?t=1543400149072"
              underline="always"
            >
              GPM skaičiavimas
            </Anchor>
          </li>
        </ul>
      </Grid.Col>
    </Grid>
  );
}
