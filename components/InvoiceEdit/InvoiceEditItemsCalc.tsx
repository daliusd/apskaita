import { useEffect, useMemo, useState } from 'react';
import { useRecoilState } from 'recoil';
import { Grid, NumberInput, Text } from '@mantine/core';
import useSWR from 'swr';

import { alreadyPaidState, lineItemsState } from '../../src/atoms';

export default function InvoiceEditItems() {
  const [lineItems] = useRecoilState(lineItemsState);
  const [alreadyPaid, setAlreadyPaid] = useRecoilState(alreadyPaidState);
  const [alreadyPaidInner, setAlreadyPaidInner] = useState(0);

  const { data: vatpayerData } = useSWR('/api/settings/vatpayer');
  const isVatPayer = vatpayerData?.value === '1';

  useEffect(() => {
    setAlreadyPaidInner(alreadyPaid / 100);
  }, [alreadyPaid]);

  const total = useMemo(
    () => lineItems.map((i) => i.price * i.amount).reduce((p, c) => p + c, 0),
    [lineItems],
  );

  const total_without_vat = useMemo(() => {
    if (isVatPayer) {
      return lineItems
        .map((i) => Math.round(i.price / (1.0 + i.vat / 100)) * i.amount)
        .reduce((p, c) => p + c, 0);
    }
  }, [isVatPayer, lineItems]);

  return (
    <>
      <Grid.Col span={12}>
        <NumberInput
          label="Iš viso"
          aria-label={'Iš viso'}
          value={total / 100}
          suffix="€"
          readOnly
        />
      </Grid.Col>

      {isVatPayer && (
        <Grid.Col span={12}>
          <NumberInput
            label="Iš viso be PVM"
            aria-label={'Iš viso'}
            value={total_without_vat / 100}
            suffix="€"
            readOnly
          />
        </Grid.Col>
      )}

      <Grid.Col span={12}>
        <NumberInput
          label="Jau apmokėta"
          aria-label={'Jau apmokėta'}
          value={alreadyPaidInner}
          onChange={(value) => {
            if (typeof value === 'string') return;
            setAlreadyPaidInner(value);

            const floored = Math.floor(value * 100);
            setAlreadyPaid(floored);
            setAlreadyPaidInner(floored / 100);
          }}
          suffix="€"
          error={
            alreadyPaid > total
              ? 'Sumokėta dalis turi būti mažesnė negu visa suma.'
              : ''
          }
        />
      </Grid.Col>
      <Grid.Col span={12}>
        <Text>Liko mokėti: {(total - alreadyPaid) / 100}€</Text>
      </Grid.Col>
    </>
  );
}
