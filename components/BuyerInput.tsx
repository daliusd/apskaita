import React from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';

import useSWR from 'swr';
import { useDebounce } from 'react-recipes';

import { cleanUpString } from '../utils/textutils';

interface IProps {
  buyer: string;
  onChange: (b: string) => void;
}

export default function BuyerInput({ buyer, onChange }: IProps) {
  const debouncedBuyer = useDebounce(buyer, 500);
  const { data: dataBuyer } = useSWR(
    `/api/uniquebuyersnames/${debouncedBuyer}`,
  );

  return (
    <Autocomplete
      id="combo-box-demo"
      options={dataBuyer ? dataBuyer.buyersNames : []}
      fullWidth
      value={buyer}
      onInputChange={(_e, newValue) => {
        onChange(cleanUpString(newValue));
      }}
      freeSolo
      renderInput={(params) => (
        <TextField
          {...params}
          label="Pirkėjas"
          inputProps={{ 'aria-label': 'Pirkėjas', ...params.inputProps }}
          multiline
          rows={4}
          variant="outlined"
        />
      )}
    />
  );
}
