import React, { useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import { useRecoilState } from 'recoil';
import { useDebounce } from 'react-recipes';
import useSWR from 'swr';

import {
  invoiceDateState,
  invoiceIdState,
  lockedState,
  seriesIdState,
  seriesNameState,
} from '../src/atoms';
import { getMsSinceEpoch } from '../utils/date';
import InvoiceDateInput from '../components/InvoiceDateInput';

export default function InvoiceEditDate() {
  const [invoiceId] = useRecoilState(invoiceIdState);
  const [invoiceDate, setInvoiceDate] = useRecoilState(invoiceDateState);
  const [seriesName] = useRecoilState(seriesNameState);
  const [seriesId] = useRecoilState(seriesIdState);
  const [locked] = useRecoilState(lockedState);

  const debouncedSeriesName = useDebounce(seriesName, 500);
  const debouncedSeriesId = useDebounce(seriesId, 500);
  const debouncedInvoiceDate = useDebounce(invoiceDate, 500);
  const { data: validInvoiceDate } = useSWR(
    debouncedSeriesName &&
      debouncedSeriesId &&
      debouncedInvoiceDate &&
      getMsSinceEpoch(debouncedInvoiceDate)
      ? `/api/validcreateddate/${debouncedSeriesName}/${debouncedSeriesId}/${getMsSinceEpoch(
          debouncedInvoiceDate,
        )}` + (invoiceId ? '?invoiceId=' + invoiceId : '')
      : null,
  );

  return (
    <InvoiceDateInput
      date={invoiceDate}
      onChange={setInvoiceDate}
      validInvoiceDate={validInvoiceDate}
      disabled={locked}
    />
  );
}
