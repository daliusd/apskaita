import React from 'react';
import TextField from '@material-ui/core/TextField';

interface IProps {
  seriesId: string;
  onChange: (value: string) => void;
  valid: boolean;
  disabled: boolean;
}

export default function SeriesIdInput({
  seriesId,
  onChange,
  valid,
  disabled,
}: IProps) {
  return (
    <TextField
      type="number"
      inputProps={{ 'aria-label': 'Serijos numeris' }}
      label="Serijos numeris"
      value={seriesId}
      onChange={(e) => {
        onChange(e.target.value);
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
