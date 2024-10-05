import {
  AspectRatio,
  Button,
  Card,
  Center,
  Grid,
  Image,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { signIn } from 'next-auth/react';

import Link from '../src/Link';
import { GoogleIcon } from './GoogleIcon';

export default function FirstPage() {
  return (
    <Grid gutter={{ base: 48 }}>
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Center h={{ md: 400 }}>
          <Title order={1}>
            Paprastai ir greitai veskite savo individualios veiklos apskaitą
          </Title>
        </Center>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Image radius="md" src="/images/mobile.jpg" alt="mobile" />
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Stack gap="xs">
          <Text>
            💡 Greitai išrašykite sąskaitas faktūras (5 žingsniai išrašyti naują
            sąskaitą faktūrą -{' '}
            <Link
              href="/straipsniai/palyginimas"
              underline="always"
              target="_blank"
            >
              greičiausiai rinkoje
            </Link>
          </Text>
          <Text>
            💡 Naudokitės „Haiku.lt“ tiek kompiuteriu tiek išmaniuoju telefonu.
          </Text>
          <Text>
            💡 Išsiųskite sąskaitas faktūras tiesiai iš savo Gmail pašto.
          </Text>
          <Text>💡 Sekite savo išlaidas.</Text>
          <Text>
            💡 Išankstinių, kreditinių ir PVM sąskaitų faktūrų palaikymas
          </Text>
          <Text>
            💡{' '}
            <Link href="/iv-skaiciuokle" underline="always" target="_blank">
              Individualios Veiklos mokesčių skaičiuoklė
            </Link>
          </Text>
          <Text>
            💡 Pajamų Ir Išlaidų Apskaitos Žurnalo PDF formatu generavimas
          </Text>
          <Text>💡 i.SAF XML generavimas</Text>
          <Text>
            💡 Daug galimybių turintis{' '}
            <Link href="/planai" underline="always" target="_blank">
              nemokamas planas
            </Link>
          </Text>
        </Stack>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Center h={{ md: 300 }}>
          <Button
            leftSection={<GoogleIcon />}
            onClick={() => {
              signIn('google');
            }}
            variant="gradient"
            gradient={{ from: 'rgba(152, 210, 237, 1)', to: 'blue', deg: 90 }}
            size="xl"
          >
            Prisijunk nemokamai
          </Button>
        </Center>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 12 }}>
        <AspectRatio ratio={16 / 9} visibleFrom="md">
          <Card shadow="md" withBorder radius="md">
            <Title order={3}>Kaip atrodo sąskaitos kūrimas:</Title>
            <video autoPlay muted loop>
              <source src="/videos/demo.webm" type="video/webm" />
            </video>
          </Card>
        </AspectRatio>

        <AspectRatio ratio={9 / 14} hiddenFrom="md">
          <Card shadow="md" withBorder radius="md">
            <Title order={3}>Kaip atrodo sąskaitos kūrimas:</Title>
            <video autoPlay muted loop>
              <source src="/videos/mobiledemo.webm" type="video/webm" />
            </video>
          </Card>
        </AspectRatio>
      </Grid.Col>

      <Grid.Col span={{ base: 12, md: 6 }}>
        <Center h={{ md: 300 }}>
          <Button
            leftSection={<GoogleIcon />}
            onClick={() => {
              signIn('google');
            }}
            variant="gradient"
            gradient={{ from: 'rgba(152, 210, 237, 1)', to: 'blue', deg: 90 }}
            size="xl"
          >
            Prisijunk dabar
          </Button>
        </Center>
      </Grid.Col>

      <Grid.Col span={{ base: 12, md: 6 }}>
        <Stack gap="xs">
          <Title order={3}>Ką žmonės daro su haiku.lt</Title>
          <Text>
            🪄 Vienas vartotojas (rankiniu būdu) per truputi daugiau nei metus
            sugebėjo išrašyti 2682 sąskaitas
          </Text>
          <Text>
            🪄 Išsiųstas sąskaitos faktūros dokumentas gali paskatinti klientus
            susimokėti
          </Text>
          <Text>
            🪄 Nors originaliai haiku.lt yra skirta individualiai veiklai,
            žmonės sėkmingai naudoja haiku.lt ir mažųjų bendrijų apskaitai.
            Realiai, jei atlyginimų apskaita jums nėra kritiškai reikalingas
            funkcionalumas, drąsiai galite naudoti haiku.lt ir mažosios
            bendrijos apskaitai.
          </Text>
        </Stack>
      </Grid.Col>
    </Grid>
  );
}
