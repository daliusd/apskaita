import React from 'react';
import TextField from '@material-ui/core/TextField';

interface IProps {
  email: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

export default function EmailInput({ email, onChange, disabled }: IProps) {
  return (
    <TextField
      inputProps={{ 'aria-label': 'Pirkėjo el. pašto adresas' }}
      label="Pirkėjo el. pašto adresas"
      value={email}
      onChange={(e) => {
        onChange(e.target.value);
      }}
      disabled={disabled}
      fullWidth
    />
  );
}
