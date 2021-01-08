import React from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';

interface IProps {
  seriesName: string;
  onChange: (value: string) => void;
  options: string[];
}

export default function SeriesNameInput({
  seriesName,
  onChange,
  options,
}: IProps) {
  return (
    <Autocomplete
      id="combo-box-demo"
      options={options}
      fullWidth
      value={seriesName}
      onInputChange={(_e, newValue) => {
        onChange(newValue);
      }}
      freeSolo
      renderInput={(params) => (
        <TextField {...params} label="Serijos pavadinimas" />
      )}
    />
  );
}
