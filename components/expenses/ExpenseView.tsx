import { useState } from 'react';
import { Button, Card, Grid, Group, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconEdit,
  IconTrash,
  IconEye,
  IconCloudDownload,
} from '@tabler/icons-react';

import { IExpense } from '../../db/db';
import { getDateString } from '../../utils/date';
import Link from '../../src/Link';
import { useRouter } from 'next/router';

interface Props {
  expense: IExpense;
  onChange: () => void;
}

export default function ExpenseView(props: Props) {
  const router = useRouter();
  const { expense } = props;
  const [expenseEditOpen, setExpenseEditOpen] = useState(false);

  const handleDelete = async () => {
    let response: Response;
    try {
      response = await fetch('/api/expenses/' + expense.id, {
        method: 'DELETE',
      });
    } catch {}

    if (!response || !response.ok || !(await response.json()).success) {
      notifications.show({
        message: 'Klaida trinant išlaidų įrašą.',
        color: 'red',
      });
      return;
    }

    notifications.show({
      message: 'Išlaidų įrašas ištrintas.',
      color: 'blue',
    });
    props.onChange();
  };

  return (
    <Card shadow="sm" withBorder mb={12}>
      <Grid>
        <Grid.Col span={12}>
          <Title order={4}>{expense.description}</Title>
        </Grid.Col>
        <Grid.Col span={6}>
          <Text>Data: {getDateString(expense.created)}</Text>
        </Grid.Col>
        <Grid.Col span={6}>
          <Text>Suma: {expense.price / 100} €</Text>
        </Grid.Col>
        <Grid.Col span={12}>
          <Group gap="sm">
            <Button
              aria-label={`Keisti`}
              size="compact-sm"
              variant="outline"
              leftSection={<IconEdit />}
              onClick={() => {
                router.push(`/islaidos/id/${expense.id}`);
              }}
            >
              Keisti
            </Button>

            {expense.webViewLink && (
              <Link href={expense.webViewLink} color="secondary">
                <Button
                  aria-label={`Peržiūrėti išlaidų dokumentą`}
                  size="compact-sm"
                  variant="outline"
                  leftSection={<IconEye />}
                >
                  Peržiūrėti
                </Button>
              </Link>
            )}
            {expense.webContentLink && (
              <Link href={expense.webContentLink} color="secondary">
                <Button
                  aria-label={`Atsisiųsti išlaidų dokumentą`}
                  size="compact-sm"
                  variant="outline"
                  leftSection={<IconCloudDownload />}
                >
                  Atsisiųsti
                </Button>
              </Link>
            )}
            <Button
              aria-label={`Ištrinti išlaidų įrašą`}
              size="compact-sm"
              variant="outline"
              color="red"
              leftSection={<IconTrash />}
              onClick={handleDelete}
            >
              Ištrinti
            </Button>
          </Group>
        </Grid.Col>
      </Grid>
    </Card>
  );
}
