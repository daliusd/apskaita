import { useState } from 'react';
import useSWR from 'swr';
import { useDebounce } from 'react-use';
import { Autocomplete } from '@mantine/core';

import { cleanUpString } from '../../utils/textutils';

interface IProps {
  seriesName: string;
  invoiceType: string;
  onChange: (value: string) => void;
  disabled: boolean;
  valid?: boolean;
}

function cleanSerialNumber(str: string) {
  return str.replace(/[^0-9a-z]/gi, '');
}

export default function SeriesNameInput({
  seriesName,
  invoiceType,
  onChange,
  disabled,
  valid,
}: IProps) {
  const [debouncedSeriesName, setDebouncedSeriesName] = useState(seriesName);
  useDebounce(() => setDebouncedSeriesName(seriesName), 500, [seriesName]);

  const { data: seriesNamesData } = useSWR(
    `/api/uniqueseriesnames/${debouncedSeriesName}` +
      (invoiceType !== 'all' ? `?invoiceType=${invoiceType}` : ''),
  );

  const options = seriesNamesData ? seriesNamesData.seriesNames : [];

  return (
    <Autocomplete
      data={options}
      value={seriesName}
      onChange={(newValue) => {
        const value = cleanSerialNumber(cleanUpString(newValue));
        onChange(value);
      }}
      label="Serijos pavadinimas"
      aria-label="Serijos pavadinimas"
      error={
        valid === false
          ? seriesName.length === 0
            ? 'Įveskite serijos pavadinimą'
            : 'Serijos pavadinimas naudojamas kito tipo sąskaitoms faktūroms'
          : ''
      }
      disabled={disabled}
    />
  );
}
