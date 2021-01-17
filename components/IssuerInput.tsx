import React from 'react';
import TextField from '@material-ui/core/TextField';

interface IProps {
  issuer: string;
  onChange: (b: string) => void;
}

export default function SellerInput({ issuer, onChange }: IProps) {
  return (
    <TextField
      label="Sąskaitą faktūrą išrašė"
      value={issuer}
      onChange={(e) => {
        onChange(e.target.value);
      }}
      fullWidth
    />
  );
}
