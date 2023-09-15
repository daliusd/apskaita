import { useRecoilState } from 'recoil';
import { useDebounce } from 'react-use';
import useSWR from 'swr';

import {
  invoiceDateState,
  invoiceIdState,
  lockedState,
  seriesIdState,
  seriesNameState,
} from '../../src/atoms';
import { getMsSinceEpoch } from '../../utils/date';
import InvoiceDateInput from '../inputs/InvoiceDateInput';
import { useState } from 'react';

export default function InvoiceEditDate() {
  const [invoiceId] = useRecoilState(invoiceIdState);
  const [invoiceDate, setInvoiceDate] = useRecoilState(invoiceDateState);
  const [seriesName] = useRecoilState(seriesNameState);
  const [seriesId] = useRecoilState(seriesIdState);
  const [locked] = useRecoilState(lockedState);

  const [debouncedSeriesName, setDebouncedSeriesName] = useState(seriesName);
  useDebounce(() => setDebouncedSeriesName(seriesName), 500, [seriesName]);

  const [debouncedSeriesId, setDebouncedSeriesId] = useState(seriesId);
  useDebounce(() => setDebouncedSeriesId(seriesId), 500, [seriesId]);

  const [debouncedInvoiceDate, setDebouncedInvoiceDate] = useState(invoiceDate);
  useDebounce(() => setDebouncedInvoiceDate(invoiceDate), 500, [invoiceDate]);

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
