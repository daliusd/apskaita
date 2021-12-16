import React, { useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import { useRecoilState } from 'recoil';
import { useDebounce } from 'react-recipes';
import useSWR from 'swr';

import {
  initialInvoiceState,
  invoiceIdState,
  lockedState,
  seriesIdState,
  seriesNameState,
} from '../../src/atoms';

export default function SeriesIdInput() {
  const [initialInvoice] = useRecoilState(initialInvoiceState);
  const [invoiceId] = useRecoilState(invoiceIdState);
  const [seriesName] = useRecoilState(seriesNameState);
  const [locked] = useRecoilState(lockedState);
  const [seriesId, setSeriesId] = useRecoilState(seriesIdState);

  const debouncedSeriesName = useDebounce(seriesName, 500);
  const debouncedSeriesId = useDebounce(seriesId, 500);

  const { data: validSeriesNumberData } = useSWR(
    debouncedSeriesName && debouncedSeriesId
      ? `/api/validseriesnumber/${debouncedSeriesName}/${debouncedSeriesId}` +
          (invoiceId ? '?invoiceId=' + invoiceId : '')
      : null,
  );

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
    <TextField
      type="number"
      inputProps={{ 'aria-label': 'Serijos numeris' }}
      label="Serijos numeris"
      value={seriesId}
      onChange={(e) => {
        setSeriesId(e.target.value);
      }}
      disabled={(!seriesIdResp.data && !seriesIdResp.error) || locked}
      fullWidth
      error={!valid || !seriesId}
      helperText={
        !valid
          ? 'Šis serijos numeris jau naudojamas.'
          : !seriesId
          ? 'Serijos numeris negali būti tuščias'
          : ''
      }
    />
  );
}
