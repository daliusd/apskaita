import { useState } from 'react';
import { Box, Button, Grid, Group, Modal, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconTrash } from '@tabler/icons-react';

import { useRouter } from 'next/router';

interface IProps {
  invoiceId?: string;
  disabled: boolean;
}

export default function InvoiceDeleteButton({ invoiceId, disabled }: IProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!invoiceId) return null;

  const handleDelete = async () => {
    let response: Response;
    try {
      response = await fetch('/api/invoices/' + invoiceId, {
        method: 'DELETE',
      });
    } catch {}

    if (!response || !response.ok || !(await response.json()).success) {
      notifications.show({
        message: 'Klaida trinant sąskaitą faktūrą.',
        color: 'red',
      });
      return;
    }

    router.replace(`/saskaitos`);
    notifications.show({
      message: 'Sąskaita faktūra ištrinta.',
      color: 'blue',
    });
  };

  return (
    <Grid.Col span={12}>
      <Button
        variant="filled"
        color="red"
        aria-label="Trinti"
        leftSection={<IconTrash />}
        onClick={() => setDeleteOpen(true)}
        disabled={disabled}
      >
        Trinti
      </Button>

      <Modal
        opened={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title={<Title order={3}>Ar tikrai norite ištrinti SF?</Title>}
        centered
      >
        <Box mb={24}>
          Mes leidžiame ištrinti sąskaitą faktūrą, tačiau jūs turėsite
          užtikrinti, kad serijos numeris būtų panaudotas kitai sąskaitai
          faktūrai. Ar tikrai norite ištrinti sąskaitą faktūrą?
        </Box>

        <Group justify="flex-end">
          <Button
            autoFocus
            onClick={() => setDeleteOpen(false)}
            variant="light"
          >
            Nutraukti
          </Button>
          <Button onClick={handleDelete}>Taip, trinti</Button>
        </Group>
      </Modal>
    </Grid.Col>
  );
}
