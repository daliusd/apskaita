import { useEffect, useState } from 'react';
import { Grid, Loader, Skeleton, Pagination, Text } from '@mantine/core';
import useSWR, { mutate } from 'swr';

import { IInvoice } from '../db/db';
import InvoiceView from './InvoiceView';
import { MultiEditModal } from './MultiEditModal/MultiEditModal';

interface Props {
  minDate?: number;
  maxDate?: number;
  seriesName?: string;
  buyer?: string;
  paid?: boolean;
  limit?: number;
  invoiceType?: string;
  showSummary?: boolean;
}

export default function Invoices(props: Props) {
  const {
    minDate,
    maxDate,
    seriesName,
    invoiceType,
    buyer,
    paid,
    limit,
    showSummary,
  } = props;
  const args: Record<string, string> = {};

  const [page, setPage] = useState(0);
  useEffect(() => {
    setPage(0);
  }, [minDate, maxDate, seriesName, invoiceType, buyer, paid, limit]);

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

  const argsplus = { ...args };
  if (limit) {
    argsplus.limit = limit.toString();
  }
  const offset = page * limit;
  if (offset) {
    argsplus.offset = offset.toString();
  }

  const params = new URLSearchParams(args).toString();
  const paramsplus = new URLSearchParams(argsplus).toString();

  const query = '/api/invoices?' + paramsplus;
  const { data, error, isLoading } = useSWR(query);
  const countQuery = '/api/invoicescount?' + params;
  const { data: invoicesCountData } = useSWR(countQuery);
  const summaryQuery = showSummary && '/api/invoicessummary?' + params;
  const { data: invoicesSummaryData } = useSWR(summaryQuery);

  const { data: vatPayerData } = useSWR('/api/settings/vatpayer');
  const isVatPayer = vatPayerData && vatPayerData.value === '1' ? true : false;

  if (error)
    return (
      <Grid.Col span={12}>
        Klaida parsiunčiant sąskaitų faktūrų sąrašą.
      </Grid.Col>
    );
  if (!invoicesCountData || (showSummary && !invoicesSummaryData))
    return (
      <Grid.Col span={12}>
        <Loader />
      </Grid.Col>
    );

  const sum = showSummary
    ? ((invoicesSummaryData.standardPaid?.price || 0) +
        (invoicesSummaryData.standardUnpaid?.price || 0)) /
      100
    : 0;
  const vatToPay = showSummary
    ? ((invoicesSummaryData.standardPaid?.vat || 0) +
        (invoicesSummaryData.standardUnpaid?.vat || 0)) /
      100
    : 0;

  const pageCount = Math.ceil(invoicesCountData.count / limit);
  const pages = showSummary && invoicesCountData.count > limit && (
    <Grid.Col span={12}>
      <Pagination
        total={pageCount}
        value={page + 1}
        siblings={3}
        onChange={(newPage) => setPage(newPage - 1)}
      />
    </Grid.Col>
  );

  const itemsCount =
    page + 1 === pageCount ? invoicesCountData.count % limit : limit;

  const mutateQueries = () => {
    mutate(query);
    mutate(countQuery);
    if (showSummary) {
      mutate(summaryQuery);
    }
  };

  return (
    <>
      {showSummary && invoicesCountData.count > 0 && (
        <Grid.Col span={12}>
          <Text>
            Rasta sąskaitų faktūrų pagal šiuos filtrus:{' '}
            {invoicesCountData.count}
            {`, kurių bendra suma ${sum} €. `}
            {(invoicesSummaryData.standardUnpaid?.cnt || 0) > 0 &&
              `Iš jų neapmokėtų:  ${
                invoicesSummaryData.standardUnpaid?.cnt || 0
              }` +
                `, kurių bendra suma ${
                  (invoicesSummaryData.standardUnpaid?.price || 0) / 100
                } €.`}
            {isVatPayer && ` PVM suma ${vatToPay} €.`}
          </Text>
        </Grid.Col>
      )}

      {invoicesCountData.count === 0 && (
        <Grid.Col span={12}>
          Nerasta sąskaitų faktūrų pagal šiuos filtrus.
        </Grid.Col>
      )}

      {showSummary && (
        <Grid.Col span={12}>
          <MultiEditModal
            minDate={minDate}
            maxDate={maxDate}
            seriesName={seriesName}
            buyer={buyer}
            paid={paid}
            invoiceType={invoiceType}
            onChange={mutateQueries}
            disabled={invoicesCountData.count === 0}
          />
        </Grid.Col>
      )}

      {pages}

      {invoicesCountData.count > 0 && (
        <Grid.Col span={12}>
          {isLoading &&
            Array(itemsCount)
              .fill(0)
              .map((_, idx) => <Skeleton key={idx} height={187} mb={12} />)}

          {data?.invoices.map((i: IInvoice) => (
            <InvoiceView key={i.id} invoice={i} onChange={mutateQueries} />
          ))}
        </Grid.Col>
      )}

      {pages}
    </>
  );
}
