import React from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import useSWR from 'swr';
import { useDebounce } from 'react-recipes';

import { cleanUpString } from '../utils/textutils';

interface IProps {
  seriesName: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

export default function SeriesNameInput({
  seriesName,
  onChange,
  disabled,
}: IProps) {
  const debouncedSeriesName = useDebounce(seriesName, 500);

  const { data: seriesNamesData } = useSWR(
    `/api/uniqueseriesnames/${debouncedSeriesName}`,
  );

  const options = seriesNamesData ? seriesNamesData.seriesNames : [];

  return (
    <Autocomplete
      options={options}
      fullWidth
      value={seriesName}
      onInputChange={(_e, newValue) => {
        onChange(cleanUpString(newValue));
      }}
      freeSolo
      renderInput={(params) => (
        <TextField
          {...params}
          label="Serijos pavadinimas"
          inputProps={{
            'aria-label': 'Serijos pavadinimas',
            ...params.inputProps,
          }}
        />
      )}
      disabled={disabled}
    />
  );
}
