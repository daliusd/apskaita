import React from 'react';
import { Button, Grid, Loader, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconTrash, IconPhotoUp } from '@tabler/icons-react';
import useSWR, { mutate } from 'swr';
import { usePlan } from '../../src/usePlan';

export default function LogoEdit() {
  const { isFree } = usePlan();
  const { data, error } = useSWR('/api/settings/logo');

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const data = new FormData();
    data.append('logo', event.target.files[0]);

    event.target.value = null; // reset

    let resp: Response;
    try {
      resp = await fetch('/api/logo', {
        method: 'POST',
        body: data,
      });
    } catch {}

    if (!resp || !resp.ok || !(await resp.json()).success) {
      notifications.show({
        message: 'Nepavyko pakeisti logo.',
        color: 'red',
      });
      return;
    }

    notifications.show({
      message: 'Logo pakeistas.',
      color: 'success',
    });

    await mutate('/api/settings/logo');
  };

  const handleDelete = async () => {
    try {
      await fetch('/api/settings/logo', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value: '' }),
      });

      await mutate('/api/settings/logo');
    } catch {}
  };

  const loaded = data || error;

  return (
    <Grid gutter={{ base: 12 }}>
      <Grid.Col span={12}>
        <Title order={4}>Logo</Title>
      </Grid.Col>
      <Grid.Col span={12}>
        <Text>
          Galite pridėti/pakeisti logotipą, kuris bus naudojamas sąskaitos
          faktūros PDF faile.
        </Text>
        {isFree && (
          <Text>Pastaba: logotipas naudojamas tik įsigijus Pro planą.</Text>
        )}
      </Grid.Col>
      {!loaded && <Loader />}
      {loaded && (
        <>
          {data && data.value && (
            <Grid.Col span={12}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={data.value} alt="logo" />
            </Grid.Col>
          )}
          <Grid.Col span={12}>
            <Button
              leftSection={<IconPhotoUp />}
              variant="subtle"
              component="label"
              aria-label="Pakeisti logo"
            >
              Pakeisti logo
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
                aria-label="Pašalinti logo"
                onClick={handleDelete}
              >
                Pašalinti logo
              </Button>
            )}
          </Grid.Col>
        </>
      )}
    </Grid>
  );
}
