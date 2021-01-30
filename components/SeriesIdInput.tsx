import React from 'react';
import TextField from '@material-ui/core/TextField';

interface IProps {
  seriesId: string;
  onChange: (value: string) => void;
  valid: boolean;
}

export default function SeriesIdInput({ seriesId, onChange, valid }: IProps) {
  return (
    <TextField
      type="number"
      inputProps={{ 'aria-label': 'Serijos numeris' }}
      label="Serijos numeris"
      value={seriesId}
      onChange={(e) => {
        onChange(e.target.value);
      }}
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
