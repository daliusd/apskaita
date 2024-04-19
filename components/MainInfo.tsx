import Link from '../src/Link';
import { Button, Grid, Text, Title } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

import Invoices from '../components/Invoices';
import Stats from './Stats';
import { OtherTools } from './OtherTools';

export default function MainInfo() {
  const { data: session } = useSession();
  const router = useRouter();

  const onClickCreateInvoice = () => {
    router.push('/saskaitos/nauja');
  };

  return (
    <Grid gutter={{ base: 24 }}>
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Grid gutter={{ base: 12 }}>
          <Grid.Col span={12}>
            <Text variant="body1" component="div">
              Esi prisijungęs/prisijungusi kaip {session.user.email}. Savo
              nustatymus galite pakeisti{' '}
              <Link href="/nustatymai" color="secondary">
                čia
              </Link>
              . Pagalbos skyrių rasite{' '}
              <Link href="/pagalba" color="secondary">
                čia
              </Link>
              .
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
            <Link href="/saskaitos" color="secondary">
              Detalesnė sąskaitų faktūrų paieška
            </Link>
          </Grid.Col>
        </Grid>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 6 }} hiddenFrom="md">
        <OtherTools />
      </Grid.Col>
    </Grid>
  );
}
