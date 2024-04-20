import { useState } from 'react';
import {
  Anchor,
  Button,
  Checkbox,
  Grid,
  TextInput,
  Text,
  Title,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
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
    <Grid>
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Grid gutter={{ base: 12 }}>
          <Grid.Col span={12}>
            <Title order={2}>
              Pajamų Ir Išlaidų Apskaitos Žurnalo Generatorius
            </Title>
          </Grid.Col>
          <Grid.Col span={12}>
            <Title order={3}>Laikotarpis ir Serija</Title>
          </Grid.Col>

          <Grid.Col span={6}>
            <DateInput
              label="Pradžios data"
              aria-label="Pradžios data"
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
          <Grid.Col span={3}>
            <DateButtonThisYear
              setFromDate={setFromDate}
              setToDate={setToDate}
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <DateButtonPreviousYear
              setFromDate={setFromDate}
              setToDate={setToDate}
            />
          </Grid.Col>
          <Grid.Col span={6}></Grid.Col>
          <Grid.Col span={12}>
            <SeriesNameInput
              seriesName={seriesName}
              onChange={setSeriesName}
              disabled={false}
              invoiceType={'standard'}
            />
          </Grid.Col>

          <Grid.Col span={12}>
            <Title order={3}>Jūsų duomenys</Title>
          </Grid.Col>

          <Grid.Col span={12}>
            <TextInput
              aria-label={'Gyventojo vardas, pavardė, asmens kodas'}
              label="Gyventojo vardas, pavardė, asmens kodas"
              value={personalInfo}
              onChange={(e) => {
                setPersonalInfo(e.target.value);
              }}
            />
          </Grid.Col>

          <Grid.Col span={12}>
            <TextInput
              aria-label={'Gyvenamoji vieta'}
              label="Gyvenamoji vieta"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
              }}
            />
          </Grid.Col>

          <Grid.Col span={12}>
            <TextInput
              aria-label={'Veiklos pavadinimas'}
              label="Veiklos pavadinimas"
              value={activityName}
              onChange={(e) => {
                setActivityName(e.target.value);
              }}
            />
          </Grid.Col>

          <Grid.Col span={12}>
            <Checkbox
              checked={includeExpenses}
              onChange={(event) => setIncludeExpenses(event.target.checked)}
              name="sent"
              label={
                'Ar įtraukti išlaidas į žurnalą? Jeigu deklaruojate, kad išlaidos sudaro 30% pajamų, išlaidų įtraukti nereikia.'
              }
            />
          </Grid.Col>

          <Grid.Col span={4}>
            <Button variant="filled" onClick={generatePdf} size="small">
              Generuoti žurnalą
            </Button>
          </Grid.Col>

          <Grid.Col span={12}>
            <Title order={3}>Naudingos nuorodos</Title>
          </Grid.Col>
          <Grid.Col span={12}>
            <Text>
              <ul>
                <li>
                  <Anchor
                    href="https://www.e-tar.lt/portal/lt/legalAct/TAR.1C8F1B983D57"
                    underline="always"
                  >
                    Informacija apie gyventojų pajamų ir išlaidų apskaitos
                    žurnalo vedimą.
                  </Anchor>
                </li>
              </ul>
            </Text>
          </Grid.Col>
        </Grid>
      </Grid.Col>
    </Grid>
  );
}
