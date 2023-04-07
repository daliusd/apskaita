import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import SeriesNameInput from '../inputs/SeriesNameInput';
import useSWR from 'swr';
import { useDebounce } from 'react-recipes';

import {
  initialInvoiceState,
  invoiceIdState,
  invoiceTypeState,
  lockedState,
  seriesNameState,
} from '../../src/atoms';

export default function InvoiceEditSeriesName() {
  const [initialInvoice] = useRecoilState(initialInvoiceState);
  const [invoiceId] = useRecoilState(invoiceIdState);
  const [seriesName, setSeriesName] = useRecoilState(seriesNameState);
  const [invoiceType] = useRecoilState(invoiceTypeState);
  const [locked] = useRecoilState(lockedState);

  const seriesNameResp = useSWR(`/api/seriesname/${invoiceType}`);

  const debouncedQuery = useDebounce(
    seriesName && invoiceType
      ? `/api/validseriesname/${seriesName}/${invoiceType}` +
          (invoiceId ? '?invoiceId=' + invoiceId : '')
      : null,
    500,
  );

  const { data: validSeriesNumberData } = useSWR(debouncedQuery);

  const valid = validSeriesNumberData?.valid ?? true;

  useEffect(() => {
    if (initialInvoice && invoiceType === initialInvoice.seriesName) {
      setSeriesName(initialInvoice.seriesName.toString());
    } else if (seriesNameResp.data) {
      setSeriesName(seriesNameResp.data.seriesName);
    }
  }, [seriesNameResp.data, initialInvoice, setSeriesName, invoiceType]);

  return (
    <SeriesNameInput
      seriesName={seriesName}
      invoiceType={invoiceType}
      onChange={setSeriesName}
      disabled={locked}
      valid={valid && seriesName.length > 0}
    />
  );
}
