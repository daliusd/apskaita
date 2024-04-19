import Link from '../src/Link';
import { Button, Grid, Text, Title } from '@mantine/core';

export const OtherTools = () => {
  return (
    <Grid gutter={{ base: 12 }}>
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
};
