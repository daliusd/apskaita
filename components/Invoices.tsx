import { useEffect, useState } from 'react';
import { Grid, CircularProgress, Pagination } from '@mui/material';
import useSWR, { mutate } from 'swr';

import { IInvoice } from '../db/db';
import InvoiceView from './InvoiceView';

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
  if (limit) {
    args.limit = limit.toString();
  }
  const offset = page * limit;
  if (offset) {
    args.offset = offset.toString();
  }
  const params = new URLSearchParams(args).toString();
  const query = '/api/invoices?' + params;
  const { data, error } = useSWR(query);
  const { data: invoicesCountData } = useSWR(
    showSummary && '/api/invoicescount?' + params,
  );
  const { data: invoicesSummaryData } = useSWR(
    showSummary && '/api/invoicessummary?' + params,
  );

  const { data: vatPayerData } = useSWR('/api/settings/vatpayer');
  const isVatPayer = vatPayerData && vatPayerData.value === '1' ? true : false;

  if (error)
    return (
      <Grid item xs={12}>
        Klaida parsiunčiant sąskaitų faktūrų sąrašą.
      </Grid>
    );
  if (
    !data ||
    (showSummary && !invoicesCountData) ||
    (showSummary && !invoicesSummaryData)
  )
    return (
      <Grid item xs={12}>
        <CircularProgress />
      </Grid>
    );

  if (!data.invoices.length)
    return (
      <Grid item xs={12}>
        Nerasta sąskaitų faktūrų pagal šiuos filtrus.
      </Grid>
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

  return (
    <>
      {showSummary && (
        <Grid item xs={12}>
          Rasta sąskaitų faktūrų pagal šiuos filtrus: {invoicesCountData.count}
          {`, kurių bendra suma ${sum} €. `}
          {(invoicesSummaryData.standardUnpaid?.cnt || 0) > 0 &&
            `Iš jų neapmokėtų:  ${
              invoicesSummaryData.standardUnpaid?.cnt || 0
            }` +
              `, kurių bendra suma ${
                (invoicesSummaryData.standardUnpaid?.price || 0) / 100
              } €.`}
          {isVatPayer && ` PVM suma ${vatToPay} €.`}
        </Grid>
      )}

      {showSummary && invoicesCountData.count > limit && (
        <Grid item xs={12}>
          <Pagination
            size="large"
            count={Math.ceil(invoicesCountData.count / limit)}
            page={page + 1}
            boundaryCount={2}
            onChange={(event, newPage) => setPage(newPage - 1)}
          />
        </Grid>
      )}

      <Grid item xs={12}>
        {data.invoices.map((i: IInvoice) => (
          <InvoiceView key={i.id} invoice={i} onChange={() => mutate(query)} />
        ))}
      </Grid>
    </>
  );
}
