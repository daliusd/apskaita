import {
  Card,
  Group,
  Text,
  Grid,
  Container,
  Stack,
  Title,
  Badge,
  Box,
} from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
import Link from '../src/Link';

const PlanCard = ({ activePlan, name, price, featureList }) => {
  const { data: session } = useSession();
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="lg">
        {session && activePlan && <Badge color="#19857b">Jūsų planas</Badge>}
        {session && !activePlan && <Box h="20px"></Box>}
        <Text fw={600} size="lg" ta="center">
          {name}
        </Text>

        <Group gap="1px" align="baseline" justify="center">
          <Title order={1} fw={500}>
            {price}€/
          </Title>
          <Text fw={500} size="md">
            metus
          </Text>
        </Group>

        <Stack>
          {featureList.map((f) =>
            f.link ? (
              <Link
                key={f.name}
                c="inherit"
                href={f.link}
                underline="always"
                target="_blank"
              >
                <IconCheck color="#19857b" size={16} /> {f.name}
              </Link>
            ) : (
              <Text key={f.name}>
                <IconCheck color="#19857b" size={16} /> {f.name}
              </Text>
            ),
          )}
        </Stack>
      </Stack>
    </Card>
  );
};

export default function Apie({ article }) {
  const featureList = [
    {
      name: 'Neribotas sąskaitų faktūrų išrašymas',
    },
    {
      name: 'Pasiekiamumas kompiuteriu ar išmaniuoju telefonu',
    },
    {
      name: 'Sąskaitų faktūrų siuntimas iš savo Gmail pašto',
    },
    {
      name: 'Išlaidų sekimas',
    },
    {
      name: 'Pajamų Ir Išlaidų Apskaitos Žurnalo PDF formatu generavimas',
    },
  ];

  const proFeatureList = [
    ...featureList,
    {
      name: 'Kelių sąskaitų faktūrų keitimas vienu metu',
      link: '/straipsniai/keliu-saskaitu-keitimas',
    },
    {
      name: 'Logotipo pridėjimas sąskaitoje faktūroje',
    },
    {
      name: 'Prioritetas iškilus problemoms ar klausimams',
    },
  ];
  return (
    <Container size="sm">
      <Grid gutter={{ base: 12 }}>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <PlanCard
            activePlan={false}
            name="Nemokamas"
            price={0}
            featureList={featureList}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <PlanCard
            activePlan={true}
            name="Pro"
            price={48}
            featureList={proFeatureList}
          />
        </Grid.Col>
      </Grid>
    </Container>
  );
}
