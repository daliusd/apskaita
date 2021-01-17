import React from 'react';
import TextField from '@material-ui/core/TextField';

interface IProps {
  extra: string;
  onChange: (b: string) => void;
}

export default function SellerInput({ extra, onChange }: IProps) {
  return (
    <TextField
      label="Papildoma informacija sąskaitoje faktūroje"
      value={extra}
      onChange={(e) => {
        onChange(e.target.value);
      }}
      fullWidth
      multiline
      rows={2}
      variant="outlined"
    />
  );
}
