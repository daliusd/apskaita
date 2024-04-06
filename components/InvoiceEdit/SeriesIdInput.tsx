import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { useDebounce } from 'react-use';
import useSWR from 'swr';

import {
  initialInvoiceState,
  invoiceIdState,
  lockedState,
  seriesIdState,
  seriesNameState,
} from '../../src/atoms';
import { NumberInput } from '@mantine/core';

export default function SeriesIdInput() {
  const [initialInvoice] = useRecoilState(initialInvoiceState);
  const [invoiceId] = useRecoilState(invoiceIdState);
  const [seriesName] = useRecoilState(seriesNameState);
  const [locked] = useRecoilState(lockedState);
  const [seriesId, setSeriesId] = useRecoilState(seriesIdState);

  const [debouncedSeriesName, setDebouncedSeriesName] = useState(seriesName);
  useDebounce(() => setDebouncedSeriesName(seriesName), 500, [seriesName]);

  const [debouncedQuery, setDebouncedQuery] = useState('');

  useDebounce(
    () =>
      setDebouncedQuery(
        debouncedSeriesName && seriesId
          ? `/api/validseriesnumber/${debouncedSeriesName}/${seriesId}` +
              (invoiceId ? '?invoiceId=' + invoiceId : '')
          : null,
      ),
    500,
    [debouncedSeriesName, seriesId, invoiceId],
  );

  const { data: validSeriesNumberData } = useSWR(debouncedQuery);

  const valid = validSeriesNumberData ? validSeriesNumberData.valid : true;

  const seriesIdResp = useSWR(
    debouncedSeriesName ? `/api/seriesid/${debouncedSeriesName}` : null,
  );

  useEffect(() => {
    if (
      invoiceId &&
      initialInvoice &&
      debouncedSeriesName === initialInvoice.seriesName
    ) {
      setSeriesId(initialInvoice.seriesId.toString());
    } else if (seriesIdResp.data) {
      setSeriesId(seriesIdResp.data.seriesId);
    }
  }, [
    seriesIdResp.data,
    debouncedSeriesName,
    initialInvoice,
    invoiceId,
    setSeriesId,
  ]);

  return (
    <NumberInput
      aria-label={'Serijos numeris'}
      label="Serijos numeris"
      value={seriesId}
      onChange={(value) => {
        setSeriesId(value.toString());
      }}
      disabled={(!seriesIdResp.data && !seriesIdResp.error) || locked}
      error={
        !valid
          ? 'Šis serijos numeris jau naudojamas.'
          : !seriesId
            ? 'Serijos numeris negali būti tuščias'
            : ''
      }
    />
  );
}
