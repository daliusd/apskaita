import React from 'react';
import { Button, Grid, Loader, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconTrash, IconPhotoUp } from '@tabler/icons-react';
import useSWR, { mutate } from 'swr';
import { usePlan } from '../../src/usePlan';
import Link from '../../src/Link';

export function BackgroundEdit() {
  const { isFree } = usePlan();
  const { data, error } = useSWR('/api/settings/background');

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const data = new FormData();
    data.append('background', event.target.files[0]);

    event.target.value = null; // reset

    let resp: Response;
    try {
      resp = await fetch('/api/background', {
        method: 'POST',
        body: data,
      });
    } catch {}

    if (!resp || !resp.ok || !(await resp.json()).success) {
      notifications.show({
        message:
          'Nepavyko pakeisti fono. Galbūt fono paveiksliukas per didelis?',
        color: 'red',
      });
      return;
    }

    notifications.show({
      message: 'Fonas pakeistas.',
      color: 'success',
    });

    await mutate('/api/settings/background');
  };

  const handleDelete = async () => {
    try {
      await fetch('/api/settings/background', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value: '' }),
      });

      await mutate('/api/settings/background');
    } catch {}
  };

  const loaded = data || error;

  return (
    <Grid gutter={{ base: 12 }}>
      <Grid.Col span={12}>
        <Title order={4}>Fonas</Title>
      </Grid.Col>
      <Grid.Col span={12}>
        <Text>
          Galite pridėti/pakeisti foną, kuris bus naudojamas sąskaitos faktūros
          PDF faile. Paveiksliuko dydis negali būti didesnis negu 75 kilobaitai.
          Daugiau informacijos{' '}
          <Link href="/straipsniai/saskaitos-fakturos-fonas">
            „Sąskaitos faktūros fonas“
          </Link>
          .
        </Text>
        {isFree && (
          <Text>Pastaba: fonas naudojamas tik įsigijus Pro planą.</Text>
        )}
      </Grid.Col>
      {!loaded && <Loader />}
      {loaded && (
        <>
          {data && data.value && (
            <Grid.Col span={12}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={data.value} width="200px" alt="background" />
            </Grid.Col>
          )}
          <Grid.Col span={12}>
            <Button
              leftSection={<IconPhotoUp />}
              variant="subtle"
              component="label"
              aria-label="Pakeisti foną"
            >
              Pakeisti foną
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleChange}
              />
            </Button>
            {data && data.value && (
              <Button
                leftSection={<IconTrash />}
                variant="subtle"
                color="red"
                aria-label="Pašalinti foną"
                onClick={handleDelete}
              >
                Pašalinti foną
              </Button>
            )}
          </Grid.Col>
        </>
      )}
    </Grid>
  );
}
