import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { Button, Grid, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';

import {
  gdriveIdState,
  invoiceDateState,
  invoiceIdState,
} from '../../src/atoms';

export default function InvoiceGDriveView() {
  const [invoiceId] = useRecoilState(invoiceIdState);
  const [invoiceDate] = useRecoilState(invoiceDateState);
  const [gdriveId, setGdriveId] = useRecoilState(gdriveIdState);

  const [processing, setProcessing] = useState(false);

  if (!invoiceId) return null;

  const handleClick = async () => {
    setProcessing(true);

    let response: Response;
    try {
      response = await fetch('/api/invoicegdrive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceId,
        }),
      });
    } catch {}

    setProcessing(false);

    if (!response || !response.ok) {
      notifications.show({
        message: 'Klaida saugant SF į jūsų Google Drive.',
        color: 'red',
      });

      return;
    }

    const message = await response.json();
    if (!message.success) {
      notifications.show({
        message: message.message || 'Klaida saugant SF į jūsų Google Drive.',
        color: 'red',
      });
      return;
    }

    setGdriveId(message.gdriveId);

    notifications.show({
      message: 'Sąskaita faktūra išsaugota į Google Drive.',
      color: 'green',
    });
  };

  if (gdriveId) {
    return (
      <Grid.Col span={12}>
        <Text>Pastaba: ši sąskaita faktūra yra išsaugota į Google Drive.</Text>
      </Grid.Col>
    );
  }

  return (
    <>
      <Grid.Col span={12}>
        <Button
          variant="outline"
          aria-label="Išsaugoti Google Drive"
          onClick={handleClick}
          disabled={processing}
        >
          Išsaugoti SF į Google Drive
        </Button>
      </Grid.Col>
      <Grid.Col span={12}>
        <Text>
          Jei norite, galite išsaugoti sąskaitą faktūrą į Google Drive. Sąskaita
          faktūra bus išsaugota į &quot;Haiku.lt/Pajamos/
          {invoiceDate.getFullYear()}&quot; direktoriją.
        </Text>
      </Grid.Col>
    </>
  );
}
