import React from 'react';
import TextField from '@material-ui/core/TextField';

import { cleanUpString } from '../utils/textutils';

interface IProps {
  issuer: string;
  onChange: (b: string) => void;
}

export default function SellerInput({ issuer, onChange }: IProps) {
  return (
    <TextField
      label="Sąskaitą faktūrą išrašė"
      inputProps={{ 'aria-label': 'SF išrašė' }}
      value={issuer}
      onChange={(e) => {
        onChange(cleanUpString(e.target.value));
      }}
      fullWidth
    />
  );
}
