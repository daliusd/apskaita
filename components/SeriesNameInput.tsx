import React from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';

import { cleanUpString } from '../utils/textutils';

interface IProps {
  seriesName: string;
  onChange: (value: string) => void;
  options: string[];
  disabled: boolean;
}

export default function SeriesNameInput({
  seriesName,
  onChange,
  options,
  disabled,
}: IProps) {
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
