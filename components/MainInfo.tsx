import Link from '../src/Link';
import { Alert, Button, Grid, Text, Title } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { IconInfoCircle } from '@tabler/icons-react';

import Invoices from '../components/Invoices';
import Stats from './Stats';
import { OtherTools } from './OtherTools';
import { usePlan } from '../src/usePlan';
import { useMemo } from 'react';

export default function MainInfo() {
  const { data: session } = useSession();
  const router = useRouter();
  const { endDate, isFree } = usePlan();
  const daysLeft = useMemo(() => {
    const now = new Date();
    if (isFree) {
      return undefined;
    } else {
      return Math.ceil((+endDate - +now) / (1000 * 60 * 60 * 24));
    }
  }, [endDate, isFree]);

  const onClickCreateInvoice = () => {
    router.push('/saskaitos/nauja');
  };

  return (
    <Grid gutter={{ base: 24 }}>
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Grid gutter={{ base: 12 }}>
          {daysLeft && daysLeft < 10 && (
            <Grid.Col span={12}>
              <Alert
                variant="light"
                color="orange"
                title={`Pro plano galiojimas baigsis po mažiau nei ${daysLeft} ${daysLeft === 1 ? 'dienos' : 'dienų'}`}
                icon={<IconInfoCircle />}
              >
                Norėdami pratęsti savo planą eikite į{' '}
                <Link href="/pro">„Pro plano“</Link> puslapį ir apmokėkite pro
                planą pagal nurodytas instrukcijas. Jeigu neapmokėsite toliau
                galėsite naudotis Haiku.lt naudodamiesi nemokamu planu.
              </Alert>
            </Grid.Col>
          )}
          <Grid.Col span={12}>
            <Text variant="body1" component="div">
              Esi prisijungęs/prisijungusi kaip {session.user.email}. Savo
              nustatymus galite pakeisti <Link href="/nustatymai">čia</Link>.
              Pagalbos skyrių rasite <Link href="/pagalba">čia</Link>.
            </Text>
          </Grid.Col>
          <Grid.Col span={12}>
            <Button
              aria-label="Nauja sąskaita faktūra"
              variant="filled"
              leftSection={<IconPlus />}
              onClick={onClickCreateInvoice}
            >
              Nauja sąskaita faktūra
            </Button>
          </Grid.Col>
          <Stats />
          <Grid.Col span={12} visibleFrom="md">
            <OtherTools />
          </Grid.Col>
        </Grid>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Grid gutter={{ base: 12 }}>
          <Grid.Col span={12}>
            <Title order={3}>Paskutinės sąskaitos faktūros</Title>
          </Grid.Col>
          <Invoices limit={5} />
          <Grid.Col span={12}>
            <Link href="/saskaitos">Detalesnė sąskaitų faktūrų paieška</Link>
          </Grid.Col>
        </Grid>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 6 }} hiddenFrom="md">
        <OtherTools />
      </Grid.Col>
    </Grid>
  );
}
