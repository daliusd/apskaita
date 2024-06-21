import {
  Group,
  Text,
  Container,
  Stack,
  Title,
  Loader,
  Button,
} from '@mantine/core';
import { mutate } from 'swr';
import { postTrial } from './api/postTrial';
import { notifications } from '@mantine/notifications';
import { getDateString } from '../utils/date';
import Link from '../src/Link';
import { usePlan } from '../src/usePlan';
import { useSession } from 'next-auth/react';

export function Pro() {
  const { data: session } = useSession();
  const { endDate, isFree, isLoading } = usePlan();

  if (isLoading) {
    return <Loader />;
  }

  const now = new Date();
  const delta = endDate && (+endDate - +now) / (1000 * 60 * 60 * 24);
  const newEndDate = new Date(isFree ? now : endDate);
  newEndDate.setFullYear(newEndDate.getFullYear() + 1);
  const isNearEnd = !isFree && delta <= 31;

  const onTrial = async () => {
    const result = await postTrial();
    if (!result.success) {
      notifications.show({
        message: result.message,
        color: 'red',
      });
      return;
    }
    await mutate('/api/settings/__plan');
  };

  return (
    <Container size="sm">
      <Stack gap={12}>
        <Title order={3}>
          Jūsų planas: {isFree ? 'Nemokamas' : 'Pro '}
          {!isFree && `(galioja iki ${endDate.toISOString().slice(0, 10)})`}
        </Title>
        <Text>
          Daugiau informacijos apie planus rasite čia:{' '}
          <Link href="/kaina" size="sm">
            „Kaina“
          </Link>
        </Text>
        {isFree && (
          <Text>
            Jei norite įsigyti „Pro“ planą metams iki{' '}
            {getDateString(newEndDate)} padarykite pavedimą šiais rekvizitais:
          </Text>
        )}
        {isNearEnd && (
          <Text>
            Jei norite prasitęsti „Pro“ planą metams iki{' '}
            {getDateString(newEndDate)} padarykite pavedimą šiais rekvizitais:
          </Text>
        )}

        {!isFree && !isNearEnd && (
          <Text>
            Gero naudojimosi Pro planu. Jei kyla klausimų ar problemų,
            susisiekite nurodytais <Link href="/kontaktai">kontaktais</Link>.
          </Text>
        )}

        {(isFree || delta <= 31) && (
          <>
            <Group gap="xs">
              <Text fw="700">Gavėjas:</Text>
              <Text>{process.env.NEXT_PUBLIC_PROPS_NAME}</Text>
            </Group>
            <Group gap="xs">
              <Text fw="700">Sąskaitos numeris:</Text>
              <Text>{process.env.NEXT_PUBLIC_PROPS_ACCOUNT_NO}</Text>
            </Group>
            <Group gap="xs">
              <Text fw="700">Mokėjimo paskirtis:</Text>
              <Text>haiku pro {session.user.email}</Text>
            </Group>
            <Group gap="xs">
              <Text fw="700">Suma:</Text>
              <Text>{process.env.NEXT_PUBLIC_PROPS_PRICE}</Text>
            </Group>
          </>
        )}
        {isFree && <Text>Gavęs mokėjimą įjungsiu Pro planą per 24h.</Text>}
        {isNearEnd && <Text>Gavęs mokėjimą pratęsiu jūsų planą per 24h.</Text>}

        {!endDate && (
          <>
            <Text>Pro planą galite išbandyti vieną mėnesį nemokamai.</Text>
            <Group>
              <Button onClick={onTrial}>Išbandyti</Button>
            </Group>
          </>
        )}
      </Stack>
    </Container>
  );
}
