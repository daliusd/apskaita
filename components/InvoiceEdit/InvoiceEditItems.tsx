import { useRecoilState } from 'recoil';
import { Button, Grid, Title } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

import LineItemEdit from './LineItemEdit';
import InvoiceEditItemsCalc from './InvoiceEditItemsCalc';

import { lineItemsState, lockedState } from '../../src/atoms';

export default function InvoiceEditItems() {
  const [lineItems, setLineItems] = useRecoilState(lineItemsState);
  const [locked] = useRecoilState(lockedState);

  return (
    <Grid gutter={{ base: 12 }}>
      <Grid.Col span={12}>
        <Title order={3}>Paslaugos ar prekės</Title>
      </Grid.Col>

      {lineItems.map((g, idx) => {
        return (
          <LineItemEdit
            key={g.id}
            idx={idx}
            lineItem={g}
            deleteEnabled={lineItems.length > 1}
            onDelete={() => {
              setLineItems(lineItems.filter((gt) => gt.id != g.id));
            }}
            onChange={(gn) => {
              setLineItems(
                lineItems.map((g) => {
                  if (gn.id != g.id) {
                    return g;
                  }
                  return gn;
                }),
              );
            }}
            disabled={locked}
          />
        );
      })}

      <Grid.Col span={12}>
        <Button
          leftSection={<IconPlus />}
          variant="subtle"
          aria-label="Pridėti paslaugą ar prekę"
          disabled={locked}
          onClick={() => {
            setLineItems([
              ...lineItems,
              {
                id: Math.max(...lineItems.map((g) => g.id)) + 1,
                name: '',
                unit: 'vnt.',
                amount: 1,
                price: 0,
              },
            ]);
          }}
        >
          Pridėti paslaugą ar prekę
        </Button>
      </Grid.Col>

      <InvoiceEditItemsCalc />
    </Grid>
  );
}
