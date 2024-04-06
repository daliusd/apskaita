import React, { useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { Checkbox, Grid, Text, Title } from '@mantine/core';
import useSWR, { mutate } from 'swr';

export default function ContactAgreement() {
  const [enabled, setEnabled] = useState(false);

  const { data: contactAgreementData } = useSWR(
    '/api/settings/contactagreement',
  );

  const agreed =
    contactAgreementData && contactAgreementData.value === '1' ? true : false;

  useEffect(() => {
    setEnabled(true);
  }, [contactAgreementData]);

  const handleContactAgreement = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const checked = event.target.checked;

    let response: Response;
    try {
      response = await fetch('/api/settings/contactagreement', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value: checked ? '1' : '0' }),
      });
    } catch {}

    await mutate('/api/settings/contactagreement');

    if (!response || !response.ok || !(await response.json()).success) {
      notifications.show({
        message: 'Įvyko klaida duodant sutikimą susisiekti.',
        color: 'red',
      });
      return;
    }
  };

  return (
    <>
      <Grid.Col span={12}>
        <Title order={3}>Sutikimas dėl susisiekimo</Title>
      </Grid.Col>
      <Grid.Col span={12}>
        <Text>
          „Haiku.lt“ tobulinimui mums kartais gali reikėti jūsų nuomonės,
          informacijos kaip jūs naudojatės sistema arba ko jums trūksta iš jos.
          Iš kitos pusės nesinori trukdyti vartotojų, kurie nori tiesiog
          naudotis sistema. Todėl klausiame ar sutinkate, kad mes kartais su
          jumis susisiektumėme:
        </Text>
      </Grid.Col>
      <Grid.Col span={12}>
        <Checkbox
          disabled={!enabled}
          checked={agreed}
          onChange={handleContactAgreement}
          name="agreed"
          color="primary"
          label={'Sutinku, kad su manimi kartais susisiektumėte.'}
        />
      </Grid.Col>
    </>
  );
}
