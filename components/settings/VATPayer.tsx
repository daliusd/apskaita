import React, { useEffect, useState } from 'react';
import { Checkbox, Grid, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import useSWR, { mutate } from 'swr';

export default function VATPayer() {
  const [enabled, setEnabled] = useState(false);

  const { data: vatPayerData } = useSWR('/api/settings/vatpayer');

  const isVatPayer = vatPayerData && vatPayerData.value === '1' ? true : false;

  useEffect(() => {
    setEnabled(true);
  }, [vatPayerData]);

  const handleVatPayer = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;

    let response: Response;
    try {
      response = await fetch('/api/settings/vatpayer', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value: checked ? '1' : '0' }),
      });
    } catch {}

    await mutate('/api/settings/vatpayer');

    if (!response || !response.ok || !(await response.json()).success) {
      notifications.show({
        message: 'Įvyko klaida keičiant PVM mokėtojo būseną.',
        color: 'red',
      });
      return;
    }
  };

  return (
    <>
      <Grid.Col span={12}>
        <Title order={3}>PVM Mokėtojas</Title>
      </Grid.Col>
      <Grid.Col span={12}>
        <Text>
          Jeigu esate PVM mokėtojas pažymėkite žemiau esančią varnelę. Ją
          pažymėjus sąskaitose faktūrose galėsite nurodyti PVM dydį, taip pat
          PDF failai bus generuojami kaip PVM sąskaitos faktūros.
        </Text>
      </Grid.Col>
      <Grid.Col span={12}>
        <Checkbox
          disabled={!enabled}
          checked={isVatPayer}
          onChange={handleVatPayer}
          name="isVatPayer"
          color="primary"
          aria-label="PVM mokėtojas"
          label={'Esu PVM mokėtojas.'}
        />
      </Grid.Col>
    </>
  );
}
