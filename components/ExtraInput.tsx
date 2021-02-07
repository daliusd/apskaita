import React from 'react';
import TextField from '@material-ui/core/TextField';

import { cleanUpString } from '../utils/textutils';

interface IProps {
  extra: string;
  onChange: (b: string) => void;
}

export default function SellerInput({ extra, onChange }: IProps) {
  return (
    <TextField
      label="Papildoma informacija sąskaitoje faktūroje"
      inputProps={{ 'aria-label': 'Papildoma informacija' }}
      value={extra}
      onChange={(e) => {
        onChange(cleanUpString(e.target.value));
      }}
      fullWidth
      multiline
      rows={2}
      variant="outlined"
    />
  );
}
