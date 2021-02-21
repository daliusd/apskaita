import React from 'react';
import TextField from '@material-ui/core/TextField';

import { cleanUpString } from '../utils/textutils';

interface IProps {
  seller: string;
  onChange: (b: string) => void;
  disabled: boolean;
}

export default function SellerInput({ seller, onChange, disabled }: IProps) {
  return (
    <TextField
      label="Pardavėjas"
      inputProps={{ 'aria-label': 'Pardavėjas' }}
      value={seller}
      onChange={(e) => {
        onChange(cleanUpString(e.target.value));
      }}
      fullWidth
      multiline
      rows={4}
      variant="outlined"
      disabled={disabled}
    />
  );
}
