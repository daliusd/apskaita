import React, { useState } from 'react';
import {
  Box,
  Button,
  Grid,
  Loader,
  Modal,
  NumberInput,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { DateInput } from '@mantine/dates';
import { IconPlus, IconCloudUpload } from '@tabler/icons-react';
import { useSession } from 'next-auth/react';

import { getMsSinceEpoch } from '../../utils/date';
import { IExpense } from '../../db/db';

export interface ExpenseEditDialogProps {
  expense?: IExpense;
  onChange: () => void;
  onClose: () => void;
}

export default function ExpenseEditDialog(props: ExpenseEditDialogProps) {
  const { expense } = props;
  const { data: session } = useSession();
  const [description, setDescription] = useState(
    expense ? expense.description : '',
  );
  const [date, setDate] = useState(
    expense ? new Date(expense.created) : new Date(),
  );
  const [price, setPrice] = useState(expense ? expense.price : 0);
  const [file, setFile] = useState<File>(null);
  const [inProgress, setInProgress] = useState(false);

  const { onClose, onChange } = props;

  const gdrive = session && (session as unknown as { gdrive: boolean }).gdrive;

  const handleClose = () => {
    onClose();
  };

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files[0]);
  };

  const handleCreateExpense = async () => {
    setInProgress(true);

    let resp: Response;
    try {
      if (expense) {
        const newExpense = {
          description,
          created: getMsSinceEpoch(date).toString(),
          price: price,
        };

        resp = await fetch('/api/expenses/' + expense.id, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newExpense),
        });
      } else {
        const data = new FormData();
        data.append('description', description);
        data.append('price', price.toString());
        data.append('created', getMsSinceEpoch(date).toString());
        if (file !== null) {
          data.append('file', file);
        }

        resp = await fetch('/api/expenses', {
          method: 'POST',
          body: data,
        });
      }
    } catch {}

    setInProgress(false);
    if (!resp || !resp.ok || !(await resp.json()).success) {
      notifications.show({
        message: expense
          ? 'Nepavyko pakeisti išlaidų įrašo'
          : 'Nepavyko pridėti išlaidų įrašo.',
        color: 'red',
      });
      return;
    }

    notifications.show({
      message: expense
        ? 'Išlaidų įrašas pakeistas'
        : 'Išlaidos įrašas pridėtas.',
      color: 'green',
    });

    handleClose();
    onChange();
  };

  return (
    <Modal
      opened={true}
      onClose={handleClose}
      title={
        <Title order={3}>
          {expense ? 'Keisti išlaidų įrašą' : 'Pridėti išlaidų įrašą'}
        </Title>
      }
      centered
    >
      <Box m={4}>
        <Grid gutter={{ base: 12 }}>
          <Grid.Col span={12}>
            <TextInput
              aria-label={'Išlaidų aprašymas'}
              label="Išlaidų aprašymas"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
              }}
            />
          </Grid.Col>

          <Grid.Col span={12}>
            <DateInput
              label="Išlaidų data"
              aria-label="Išlaidų data"
              value={date}
              onChange={setDate}
              valueFormat="YYYY-MM-DD"
            />
          </Grid.Col>

          <Grid.Col span={12}>
            <NumberInput
              label="Išlaidų suma"
              aria-label="Išlaidų suma"
              value={price}
              onChange={(value) => {
                if (typeof value === 'string') return;
                setPrice(value);
              }}
            />
          </Grid.Col>

          {gdrive && !expense && (
            <Grid.Col span={12}>
              {file === null && (
                <Button
                  leftSection={<IconCloudUpload />}
                  variant="subtle"
                  component="label"
                  aria-label="Pridėti failą"
                >
                  Pridėti failą
                  <input type="file" hidden onChange={handleChange} />
                </Button>
              )}
              {file !== null && <Text>Failas: {file.name}</Text>}
            </Grid.Col>
          )}

          <Grid.Col span={12}>
            {!inProgress && (
              <Button
                aria-label={
                  expense ? 'Pakeisti išlaidų įrašą' : 'Pridėti išlaidų įrašą'
                }
                variant="filled"
                leftSection={<IconPlus />}
                onClick={handleCreateExpense}
              >
                {expense ? 'Pakeisti išlaidų įrašą' : 'Pridėti išlaidų įrašą'}
              </Button>
            )}
            {inProgress && <Loader />}
          </Grid.Col>
        </Grid>
      </Box>
    </Modal>
  );
}
