import { useState } from 'react';
import { Anchor, Grid, Title, Text, Button, TextInput } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useSession } from 'next-auth/react';

import { getMsSinceEpoch } from '../utils/date';
import { useRouter } from 'next/router';
import SeriesNameInput from '../components/inputs/SeriesNameInput';
import { DefaultDates } from '../components/inputs/DefaultDates';

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

  const [seriesName, setSeriesName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');

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
    <Grid>
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Grid gutter={{ base: 12 }}>
          <Grid.Col span={12}>
            <Title order={2}>i.SAF generatorius</Title>
          </Grid.Col>
          <Grid.Col span={12}>
            <Text>
              i.SAF generatorius nėra visiškai išbaigtas. Šiuo metu jis tinkamas
              tik generuoti sąskaitų faktūrų i.SAF XML failui (išlaidų i.SAF
              nėra generuojamas). Taip pat šis įrankis šiuo metu daro prielaidą,
              kad SF išrašomos Lietuvoje. Jeigu jūs SF išrašote pirkėjams iš
              kitų šalių ir jums reikia i.SAF, susisiekite su manimi -
              pažiūrėsime, ką galime padaryti.
            </Text>
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

          <DefaultDates setFromDate={setFromDate} setToDate={setToDate} />

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
              aria-label={'Asmens kodas'}
              label="Asmens kodas"
              value={registrationNumber}
              onChange={(e) => {
                setRegistrationNumber(e.target.value);
              }}
            />
          </Grid.Col>

          <Grid.Col span={4}>
            <Button variant="filled" onClick={generateISAF} size="small">
              Generuoti i.SAF XML
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
                    href="https://www.vmi.lt/evmi/documents/20142/391113/i.SAF+duomen%C5%B3+rinkmenos+XML+strukturos+apraso+aprasymas+%281.2.1%29.pdf/e022f941-29e7-7f9a-9a93-63d3cf72b294?t=1545213233801"
                    underline="always"
                  >
                    Informacija apie i.SAF XML formatą
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
