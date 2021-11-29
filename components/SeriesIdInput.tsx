import React from 'react';
import TextField from '@material-ui/core/TextField';
import { useRecoilState } from 'recoil';
import { useDebounce } from 'react-recipes';
import useSWR from 'swr';

import { invoiceIdState, seriesIdState, seriesNameState } from '../src/atoms';

interface IProps {
  disabled: boolean;
}

export default function SeriesIdInput({ disabled }: IProps) {
  const [invoiceId] = useRecoilState(invoiceIdState);
  const [seriesName] = useRecoilState(seriesNameState);
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

  return (
    <TextField
      type="number"
      inputProps={{ 'aria-label': 'Serijos numeris' }}
      label="Serijos numeris"
      value={seriesId}
      onChange={(e) => {
        setSeriesId(e.target.value);
      }}
      disabled={disabled}
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
