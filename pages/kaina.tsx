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
  Button,
} from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
import Link from '../src/Link';
import { usePlan } from '../src/usePlan';
import { useRouter } from 'next/router';

const PlanCard = ({ activePlan, name, price, featureList }) => {
  const { data: session } = useSession();
  const router = useRouter();

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
          {!activePlan && price > 0 && (
            <Button
              onClick={() => {
                router.push('/pro');
              }}
              variant="gradient"
              gradient={{ from: 'rgba(152, 210, 237, 1)', to: 'blue', deg: 90 }}
              size="xl"
            >
              Pirkti
            </Button>
          )}
        </Stack>
      </Stack>
    </Card>
  );
};

export default function Apie({ article }) {
  const { isFree } = usePlan();
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
    {
      name: 'Viskas iš nemokamo plano',
    },
    {
      name: 'Kelių sąskaitų faktūrų keitimas vienu metu',
      link: '/straipsniai/keliu-saskaitu-keitimas',
    },
    {
      name: 'Logotipo pridėjimas sąskaitoje faktūroje',
    },
    {
      name: 'Fono pakeitimas sąskaitoje faktūroje',
      link: '/straipsniai/saskaitos-fakturos-fonas',
    },
    {
      name: 'Papildomos informacijos programavimas',
      link: '/straipsniai/papildomos-informacijos-programavimas',
    },
    {
      name: 'Prioritetas iškilus problemoms ar klausimams',
      link: '/straipsniai/filosofija',
    },
  ];
  return (
    <Container size="sm">
      <Grid gutter={{ base: 12 }}>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <PlanCard
            activePlan={isFree}
            name="Nemokamas"
            price={0}
            featureList={featureList}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <PlanCard
            activePlan={!isFree}
            name="Pro"
            price={parseInt(process.env.NEXT_PUBLIC_PROPS_PRICE, 10)}
            featureList={proFeatureList}
          />
        </Grid.Col>
      </Grid>
    </Container>
  );
}
