import { useMemo, useState } from 'react';
import { Autocomplete, Button, Grid, NumberInput, Text } from '@mantine/core';
import useSWR from 'swr';
import { useDebounce } from 'react-use';
import { IconClearAll } from '@tabler/icons-react';

import { ILineItem } from '../../db/db';
import { cleanUpString } from '../../utils/textutils';
import Link from '../../src/Link';
import { vatCodeToVat, vatCodes, vatToVatCode } from './vatUtils';

interface Props {
  lineItem: ILineItem;
  idx: number;
  onChange: (lineItem: ILineItem) => void;
  deleteEnabled: boolean;
  onDelete: () => void;
  disabled: boolean;
}

export default function LineItemEdit({
  lineItem,
  idx,
  onChange,
  onDelete,
  deleteEnabled,
  disabled,
}: Props) {
  const [amount, setAmount] = useState(lineItem.amount);
  const [price, setPrice] = useState(lineItem.price / 100);
  const [vat, setVat] = useState(lineItem.vat || 0);

  const sum = useMemo(() => {
    return lineItem.price * lineItem.amount;
  }, [lineItem.price, lineItem.amount]);

  const price_without_vat = useMemo(() => {
    return !isNaN(vat) ? Math.round(lineItem.price / (1.0 + vat / 100)) : sum;
  }, [lineItem.price, sum, vat]);

  const sum_without_vat = useMemo(() => {
    return price_without_vat * lineItem.amount;
  }, [lineItem.amount, price_without_vat]);

  const { data: vatpayerData } = useSWR('/api/settings/vatpayer');
  const isVatPayer = vatpayerData?.value === '1';

  const [debouncedLineItemName, setDebouncedLineItemName] = useState(
    lineItem.name,
  );
  useDebounce(() => setDebouncedLineItemName(lineItem.name), 500, [
    lineItem.name,
  ]);
  const { data } = useSWR(`/api/uniquelineitemsnames/${debouncedLineItemName}`);

  const lid = ` ${idx + 1}`;

  return (
    <>
      <Grid.Col span={12}>
        <Autocomplete
          label="Paslaugos ar prekės pavadinimas"
          aria-label={'Paslaugos pavadinimas' + lid}
          data={data ? data.lineItemsNames.map((i) => i.name) : []}
          disabled={disabled}
          value={lineItem.name}
          onChange={(newValue) => {
            let newPrice = lineItem.price;
            let newVat = undefined;
            newValue = cleanUpString(newValue);
            if (newValue !== lineItem.name) {
              if (data) {
                const existingItems = data.lineItemsNames.filter(
                  (i) => i.name === newValue,
                );
                if (existingItems.length > 0) {
                  newPrice = existingItems[0].price;
                  setPrice(newPrice / 100);
                  if (isVatPayer) {
                    newVat = existingItems[0].vat || 0;
                    setVat(newVat);
                  }
                }
              }

              onChange({
                ...lineItem,
                name: newValue,
                price: newPrice,
                vat: newVat,
              });
            }
          }}
        />
      </Grid.Col>

      <Grid.Col span={3}>
        <Autocomplete
          label="Matas"
          aria-label={'Matas' + lid}
          data={['vnt.', 'kg', 'val.']}
          disabled={disabled}
          value={lineItem.unit}
          onChange={(newValue) => {
            onChange({ ...lineItem, unit: newValue });
          }}
        />
      </Grid.Col>

      <Grid.Col span={3}>
        <NumberInput
          label="Kiekis"
          aria-label={'Kiekis' + lid}
          value={amount}
          disabled={disabled}
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
          disabled={disabled}
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

      {isVatPayer && (
        <>
          <Grid.Col span={3}>
            <NumberInput
              label="PVM proc"
              aria-label={'PVMproc' + lid}
              value={vat}
              disabled={disabled}
              onChange={(value) => {
                if (typeof value === 'string') return;
                setVat(value);
                onChange({
                  ...lineItem,
                  vat: value || 0,
                  vatcode: vatToVatCode[value || 0],
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
            <Autocomplete
              label="PVM kodas"
              aria-label={'PVM kodas' + lid}
              data={vatCodes}
              disabled={disabled}
              value={lineItem.vatcode || vatToVatCode[lineItem.vat]}
              onChange={(newValue) => {
                onChange({
                  ...lineItem,
                  vatcode: newValue,
                });
              }}
            />
          </Grid.Col>
          {lineItem.vatcode !== undefined &&
            vatCodeToVat[lineItem.vatcode] !== undefined &&
            lineItem.vat !== vatCodeToVat[lineItem.vatcode] && (
              <Grid.Col span={12}>
                <Text size="sm">
                  <Text span fw="700">
                    Pastaba:
                  </Text>{' '}
                  {lineItem.vatcode} kodui taikomas{' '}
                  {vatCodeToVat[lineItem.vatcode]}% PVM. Ar nurodėte gerą PVM
                  kodą?
                </Text>
              </Grid.Col>
            )}
          {vat === 0 && (
            <Grid.Col span={12}>
              <Text size="sm">
                <Text span fw="700">
                  Pastaba:
                </Text>{' '}
                0 procentų PVM naudojamas PVM neapmokestinamoms paslaugoms.
                Galbūt nesate PVM mokėtojas ir jums turėtų užtekti paprastų
                sąskaitų faktūrų? Jei nesate PVM mokėtojas nurodykite tai{' '}
                <Link href="/nustatymai">Nustatymuose</Link>.
              </Text>
            </Grid.Col>
          )}
        </>
      )}

      {deleteEnabled && (
        <Grid.Col span={3}>
          <Button
            variant="subtle"
            color="red"
            leftSection={<IconClearAll />}
            onClick={onDelete}
            aria-label={'Pašalinti' + lid}
            disabled={disabled}
          >
            Pašalinti
          </Button>
        </Grid.Col>
      )}
    </>
  );
}
