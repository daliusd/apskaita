import React, { useState } from 'react';
import { mutate } from 'swr';
import {
  Button,
  Grid,
  Loader,
  NumberInput,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { DateInput } from '@mantine/dates';
import {
  IconPlus,
  IconCloudUpload,
  IconDeviceFloppy,
} from '@tabler/icons-react';
import { useSession } from 'next-auth/react';

import { getMsSinceEpoch } from '../../utils/date';
import { IExpense } from '../../db/db';
import { useRouter } from 'next/router';
import { cleanUpString } from '../../utils/textutils';
import { ExpenseLineItems } from './ExpenseLineItems';
import { ExpenseItem } from './types';

export interface Props {
  expense?: IExpense;
}

export function ExpenseEdit({ expense }: Props) {
  const { data: session } = useSession();
  const router = useRouter();

  const [description, setDescription] = useState(
    expense ? expense.description : '',
  );
  const [invoiceno, setInvoiceno] = useState(
    expense ? expense.invoiceno || '' : '',
  );
  const [seller, setSeller] = useState(expense ? expense.seller || '' : '');
  const [items, setItems] = useState<ExpenseItem[]>(() => {
    try {
      return JSON.parse(expense ? expense.items || '[]' : '[]');
    } catch {
      return [];
    }
  });

  const [createDate, setCreateDate] = useState(
    expense ? new Date(expense.created) : new Date(),
  );

  const [price, setPrice] = useState(expense ? expense.price / 100 : 0);
  const [file, setFile] = useState<File>(null);
  const [inProgress, setInProgress] = useState(false);

  const gdrive = session && (session as unknown as { gdrive: boolean }).gdrive;

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setFile(event.target.files[0]);
  };

  const handleCreateExpense = async () => {
    setInProgress(true);

    let resp: Response;
    try {
      if (expense) {
        const newExpense = {
          description,
          invoiceno,
          seller,
          items: JSON.stringify(items),
          created: getMsSinceEpoch(createDate).toString(),
          price: price * 100,
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
        data.append('invoiceno', invoiceno);
        data.append('seller', seller);
        data.append('items', JSON.stringify(items));
        data.append('price', (price * 100).toString());
        data.append('created', getMsSinceEpoch(createDate).toString());
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
    if (!resp || !resp.ok) {
      notifications.show({
        message: expense
          ? 'Nepavyko pakeisti išlaidų įrašo'
          : 'Nepavyko pridėti išlaidų įrašo.',
        color: 'red',
      });
      return;
    }

    const responseJson = await resp.json();

    if (!responseJson.success) {
      notifications.show({
        message: expense
          ? 'Nepavyko pakeisti išlaidų įrašo'
          : 'Nepavyko pridėti išlaidų įrašo.',
        color: 'red',
      });
      return;
    }

    if (!expense) {
      router.push(`/islaidos/id/${responseJson.expenseId}`);
    } else {
      mutate(`/api/expenses/${expense.id}`);
    }

    notifications.show({
      message: expense
        ? 'Išlaidų įrašas pakeistas'
        : 'Išlaidos įrašas pridėtas.',
      color: 'green',
    });
  };

  return (
    <Grid gutter={{ base: 24 }}>
      <Grid.Col span={{ base: 12 }}>
        <Grid gutter={{ base: 24 }}>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Title order={2}>
              {expense ? 'Keisti išlaidų įrašą' : 'Pridėti išlaidų įrašą'}
            </Title>
          </Grid.Col>
        </Grid>
      </Grid.Col>

      <Grid.Col span={{ base: 12, md: 6 }}>
        <Grid gutter={{ base: 12 }}>
          <Grid.Col span={12}>
            <Title order={3}>Pagrindinė informacija</Title>
          </Grid.Col>

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
              value={createDate}
              onChange={setCreateDate}
              valueFormat="YYYY-MM-DD"
            />
          </Grid.Col>

          <Grid.Col span={12}>
            <NumberInput
              label="Išlaidų suma"
              aria-label="Išlaidų suma"
              value={price}
              readOnly={items.length > 0}
              onChange={(value) => {
                if (typeof value === 'string') return;
                setPrice(value);
              }}
              suffix=" €"
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
                  <input type="file" hidden onChange={handleFileChange} />
                </Button>
              )}
              {file !== null && <Text>Failas: {file.name}</Text>}
            </Grid.Col>
          )}

          <Grid.Col span={12}>
            <Title order={3}>Detalesnė informacija</Title>
            <Text size="sm">
              Ši informacija yra svarbi tik, jei esate PVM mokėtojas.
            </Text>
          </Grid.Col>

          <Grid.Col span={12}>
            <TextInput
              aria-label={'Sąskaitos faktūros numeris'}
              label="Sąskaitos faktūros numeris"
              value={invoiceno}
              onChange={(e) => {
                setInvoiceno(e.target.value);
              }}
            />
          </Grid.Col>

          <Grid.Col span={12}>
            <Textarea
              label="Pardavėjas"
              aria-label={'Pardavėjas'}
              value={seller}
              onChange={(e) => {
                setSeller(cleanUpString(e.target.value));
              }}
              autosize
              minRows={4}
            />
          </Grid.Col>
        </Grid>
      </Grid.Col>

      <Grid.Col span={{ base: 12, md: 6 }}>
        <Grid gutter={{ base: 12 }}>
          <Grid.Col span={12}>
            <ExpenseLineItems
              items={items}
              onChange={(updatedItems) => {
                setItems(updatedItems);
                setPrice(
                  updatedItems.reduce((p, c) => p + c.price * c.amount, 0) /
                    100,
                );
              }}
            />
          </Grid.Col>
          <Grid.Col span={12}>
            {!inProgress && (
              <Button
                aria-label={
                  expense ? 'Pakeisti išlaidų įrašą' : 'Pridėti išlaidų įrašą'
                }
                variant="filled"
                leftSection={expense ? <IconDeviceFloppy /> : <IconPlus />}
                onClick={handleCreateExpense}
              >
                {expense ? 'Pakeisti išlaidų įrašą' : 'Pridėti išlaidų įrašą'}
              </Button>
            )}
            {inProgress && <Loader />}
          </Grid.Col>
        </Grid>
      </Grid.Col>
    </Grid>
  );
}
