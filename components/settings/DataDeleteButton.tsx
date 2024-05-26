import { useState } from 'react';
import { signOut } from 'next-auth/react';

import {
  Button,
  Checkbox,
  Grid,
  Group,
  Modal,
  Text,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';

import { IconTrash } from '@tabler/icons-react';
import { deleteUserdata } from '../api/deleteUserdata';

export default function DataDeleteButton() {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleDelete = async () => {
    if (!(await deleteUserdata())) {
      notifications.show({
        message: 'Klaida trinant paskyrą.',
        color: 'red',
      });
      return;
    }

    notifications.show({
      message: 'Jūsų paskyra ištrinta.',
      color: 'blue',
    });
    signOut();
  };

  return (
    <>
      <Grid.Col span={12}>
        <Text>Taip pat galite ištrinti savo paskyrą.</Text>
      </Grid.Col>
      <Grid.Col span={12}>
        <Button
          variant="filled"
          color="red"
          aria-label="Ištrinti paskyrą"
          leftSection={<IconTrash />}
          onClick={() => setDeleteOpen(true)}
        >
          Ištrinti paskyrą
        </Button>

        <Modal
          opened={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          title={
            <Title order={3}>Ar tikrai norite ištrinti savo paskyrą?</Title>
          }
          centered
        >
          <Grid gutter={{ base: 12 }}>
            <Grid.Col span={12}>
              <Text>
                Jūsų duomenys bus ištrinti negrįžtamai ir jų nebebus galima
                atstatyti.
              </Text>
            </Grid.Col>
            <Grid.Col span={12}>
              <Checkbox
                checked={agreed}
                onChange={() => setAgreed(!agreed)}
                name="agreed"
                label={'Taip, tikrai noriu ištrinti savo paskyrą.'}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Group justify="flex-end">
                <Button
                  variant="subtle"
                  autoFocus
                  onClick={() => setDeleteOpen(false)}
                >
                  Nutraukti
                </Button>

                <Button onClick={handleDelete} disabled={!agreed}>
                  Trinti
                </Button>
              </Group>
            </Grid.Col>
          </Grid>
        </Modal>
      </Grid.Col>
    </>
  );
}
