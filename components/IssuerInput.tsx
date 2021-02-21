import React from 'react';
import TextField from '@material-ui/core/TextField';

import { cleanUpString } from '../utils/textutils';

interface IProps {
  issuer: string;
  onChange: (b: string) => void;
  disabled: boolean;
}

export default function SellerInput({ issuer, onChange, disabled }: IProps) {
  return (
    <TextField
      label="Sąskaitą faktūrą išrašė"
      inputProps={{ 'aria-label': 'SF išrašė' }}
      value={issuer}
      disabled={disabled}
      onChange={(e) => {
        onChange(cleanUpString(e.target.value));
      }}
      fullWidth
    />
  );
}
