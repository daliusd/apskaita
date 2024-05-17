import { useMemo, useState } from 'react';
import { Button, Grid, NumberInput, TextInput } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';

import { cleanUpString } from '../../utils/textutils';
import { ExpenseItem } from './types';

interface Props {
  lineItem: ExpenseItem;
  idx: number;
  onChange: (lineItem: ExpenseItem) => void;
  onDelete: () => void;
}

export function ExpenseLineItemEdit({
  lineItem,
  idx,
  onChange,
  onDelete,
}: Props) {
  const [price, setPrice] = useState(lineItem.price / 100);
  const [amount, setAmount] = useState(lineItem.amount || 0);
  const [vat, setVat] = useState(lineItem.vat || 0);

  const sum = useMemo(() => {
    return lineItem.price * lineItem.amount;
  }, [lineItem.price, lineItem.amount]);

  const price_without_vat = useMemo(() => {
    return !isNaN(vat)
      ? Math.round(lineItem.price / (1.0 + vat / 100))
      : lineItem.price;
  }, [lineItem.price, vat]);

  const sum_without_vat = useMemo(() => {
    return price_without_vat * lineItem.amount;
  }, [lineItem.amount, price_without_vat]);

  const lid = ` ${idx + 1}`;

  return (
    <>
      <Grid.Col span={12}>
        <TextInput
          label="Paslaugos ar prekės pavadinimas"
          aria-label={'Paslaugos pavadinimas' + lid}
          value={lineItem.name}
          onChange={(e) => {
            const newValue = cleanUpString(e.target.value);
            if (newValue !== lineItem.name) {
              onChange({
                ...lineItem,
                name: newValue,
              });
            }
          }}
        />
      </Grid.Col>

      <Grid.Col span={3}>
        <NumberInput
          label="Kiekis"
          aria-label={'Kiekis' + lid}
          value={amount}
          onChange={(value) => {
            if (typeof value === 'string') return;
            setAmount(value);
            onChange({
              ...lineItem,
              amount: value || 0,
            });
          }}
        />
      </Grid.Col>

      <Grid.Col span={3}>
        <NumberInput
          label="Kaina"
          aria-label={'Kaina' + lid}
          value={price}
          onChange={(value) => {
            if (typeof value === 'string') return;
            let price = Math.round(parseFloat(value.toString()) * 100);
            if (price <= 0) {
              price = 1;
              setPrice(0.01);
            } else if (price > 100_000_000) {
              price = 100_000_000;
              setPrice(price / 100);
            } else {
              setPrice(value);
            }
            onChange({
              ...lineItem,
              price: price || 0,
            });
          }}
          suffix=" €"
        />
      </Grid.Col>

      <Grid.Col span={3}>
        <NumberInput label="Viso" readOnly value={sum / 100} suffix=" €" />
      </Grid.Col>

      <Grid.Col span={3}></Grid.Col>

      <Grid.Col span={3}>
        <NumberInput
          label="PVM proc"
          aria-label={'PVMproc' + lid}
          value={vat}
          onChange={(value) => {
            if (typeof value === 'string') return;
            setVat(value);
            onChange({
              ...lineItem,
              vat: value || 0,
            });
          }}
        />
      </Grid.Col>
      <Grid.Col span={3}>
        <NumberInput
          label="PVM"
          readOnly
          value={(lineItem.price - price_without_vat) / 100}
          suffix=" €"
        />
      </Grid.Col>
      <Grid.Col span={3}>
        <NumberInput
          label="Kaina be PVM"
          readOnly
          value={price_without_vat / 100}
          suffix=" €"
        />
      </Grid.Col>
      <Grid.Col span={3}>
        <NumberInput
          label="Viso be PVM"
          readOnly
          value={sum_without_vat / 100}
          suffix=" €"
        />
      </Grid.Col>
      <Grid.Col span={12}>
        <TextInput
          label="PVM kodas"
          aria-label={'PVM kodas' + lid}
          value={lineItem.vatcode}
          onChange={(e) => {
            onChange({
              ...lineItem,
              vatcode: e.target.value,
            });
          }}
        />
      </Grid.Col>

      <Grid.Col span={3}>
        <Button
          variant="subtle"
          color="red"
          leftSection={<IconTrash />}
          onClick={onDelete}
          aria-label={'Pašalinti' + lid}
        >
          Pašalinti
        </Button>
      </Grid.Col>
    </>
  );
}
