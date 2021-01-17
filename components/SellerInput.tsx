import React from 'react';
import TextField from '@material-ui/core/TextField';

interface IProps {
  seller: string;
  onChange: (b: string) => void;
}

export default function SellerInput({ seller, onChange }: IProps) {
  return (
    <TextField
      label="Pardavėjas"
      value={seller}
      onChange={(e) => {
        onChange(e.target.value);
      }}
      fullWidth
      multiline
      rows={4}
      variant="outlined"
    />
  );
}
