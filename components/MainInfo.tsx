import Link from '../src/Link';
import { Button, Grid, Text, Title } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

import Invoices from '../components/Invoices';
import Stats from './Stats';

export default function MainInfo() {
  const { data: session } = useSession();
  const router = useRouter();

  const onClickCreateInvoice = () => {
    router.push('/saskaitos/nauja');
  };

  return (
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

      <Grid.Col span={12}>
        <Title order={3}>Paskutinės sąskaitos faktūros</Title>
      </Grid.Col>
      <Invoices limit={5} />
      <Grid.Col span={12}>
        <Link href="/saskaitos" color="secondary">
          Detalesnė sąskaitų faktūrų paieška
        </Link>
      </Grid.Col>
      <Grid.Col span={12}>
        <Title order={3}>Kiti įrankiai</Title>
      </Grid.Col>
      <Grid.Col span={12}>
        <Link href="/iv-skaiciuokle">
          Individualios Veiklos mokesčių skaičiuokle
        </Link>
      </Grid.Col>
      <Grid.Col span={12}>
        <Link href="/pajamu-islaidu-zurnalas">
          Pajamų Ir Išlaidų Apskaitos Žurnalo Generatorius
        </Link>
      </Grid.Col>
      <Grid.Col span={12}>
        <Link href="/isaf-generatorius">
          i.SAF generatorius (PVM mokėtojams)
        </Link>
      </Grid.Col>
    </Grid>
  );
}
