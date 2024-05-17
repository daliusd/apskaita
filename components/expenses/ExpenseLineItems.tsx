import { Button, Grid, Text, Title } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { ExpenseItem } from './types';
import { ExpenseLineItemEdit } from './ExpenseLineItemEdit';

interface Props {
  items: ExpenseItem[];
  onChange: (items: ExpenseItem[]) => void;
}

export function ExpenseLineItems({ items, onChange }: Props) {
  return (
    <Grid gutter={{ base: 12 }}>
      <Grid.Col span={12}>
        <Title order={3}>Paslaugos ar prekės</Title>
        <Text size="sm">
          Ši informacija yra svarbi tik, jei esate PVM mokėtojas arba norite
          sekti savo išlaidas detaliai. Jei čia nurodysite informaciją, tada
          išlaidų suma bus apskaičiuojama iš įvestos informacijos.
        </Text>
      </Grid.Col>

      {items.map((g, idx) => {
        return (
          <ExpenseLineItemEdit
            key={g.id}
            idx={idx}
            lineItem={g}
            onDelete={() => {
              onChange(items.filter((gt) => gt.id != g.id));
            }}
            onChange={(gn) => {
              onChange(
                items.map((g) => {
                  if (gn.id != g.id) {
                    return g;
                  }
                  return gn;
                }),
              );
            }}
          />
        );
      })}

      <Grid.Col span={12}>
        <Button
          leftSection={<IconPlus />}
          variant="subtle"
          aria-label="Pridėti paslaugą ar prekę"
          onClick={() => {
            onChange([
              ...items,
              {
                id: Math.max(...items.map((g) => g.id)) + 1,
                name: '',
                amount: 1,
                price: 0,
                vat: 0,
                vatcode: '',
              },
            ]);
          }}
        >
          Pridėti paslaugą ar prekę
        </Button>
      </Grid.Col>
    </Grid>
  );
}
