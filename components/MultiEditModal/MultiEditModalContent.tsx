import { Loader, Stack, Text } from '@mantine/core';
import useSWR, { mutate } from 'swr';

import { InvoicesTable } from './InvoicesTable';

interface Props {
  minDate?: number;
  maxDate?: number;
  seriesName?: string;
  buyer?: string;
  paid?: boolean;
  invoiceType?: string;
  onChange?: () => void;
}

export function MultiEditModalContent({
  minDate,
  maxDate,
  seriesName,
  invoiceType,
  buyer,
  paid,
  onChange,
}: Props) {
  const args: Record<string, string> = {};

  if (minDate) {
    args.minDate = minDate.toString();
  }
  if (maxDate) {
    args.maxDate = maxDate.toString();
  }
  if (invoiceType) {
    args.invoiceType = invoiceType;
  }
  if (seriesName) {
    args.seriesName = seriesName;
  }
  if (buyer) {
    args.buyer = buyer;
  }
  if (paid !== undefined) {
    args.paid = paid ? '1' : '0';
  }

  const params = new URLSearchParams(args).toString();

  const query = '/api/invoices?' + params;
  const { data, error, isLoading } = useSWR(query);

  if (error) {
    return (
      <Stack>
        <Text data-testid="error">
          Klaida parsiunčiant sąskaitų faktūrų sąrašą.
        </Text>
      </Stack>
    );
  }

  const afterChanges = () => {
    mutate(query);
    onChange();
  };

  return (
    <Stack>
      {isLoading && <Loader />}

      {data?.invoices && (
        <>
          <InvoicesTable invoices={data.invoices} onChange={afterChanges} />
        </>
      )}
    </Stack>
  );
}
