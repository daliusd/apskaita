import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

import useSWR from 'swr';
import { useDebounce } from 'react-recipes';

import { cleanUpString } from '../../utils/textutils';

interface IProps {
  buyer: string;
  onChange: (b: { buyer: string; email: string }) => void;
  disabled: boolean;
  rows?: number;
}

export default function BuyerInput({
  buyer,
  onChange,
  disabled,
  rows = 4,
}: IProps) {
  const debouncedBuyer = useDebounce(buyer, 500);
  const { data: dataBuyer } = useSWR(`/api/uniquebuyers/${debouncedBuyer}`);
  const buyerToEmail = {};
  dataBuyer?.buyers?.forEach((b) => {
    buyerToEmail[b.buyer] = b.email;
  });

  return (
    <Autocomplete
      id="combo-box-demo"
      options={dataBuyer?.buyers?.map((b) => b.buyer) || []}
      fullWidth
      value={buyer}
      disabled={disabled}
      onInputChange={(_e, newValue) => {
        const value = cleanUpString(newValue);
        const email = buyerToEmail[value] || '';
        onChange({ buyer: value, email });
      }}
      freeSolo
      renderInput={(params) => (
        <TextField
          {...params}
          label="Pirkėjas"
          inputProps={{ 'aria-label': 'Pirkėjas', ...params.inputProps }}
          multiline
          rows={rows}
          variant={rows > 1 ? 'outlined' : 'standard'}
        />
      )}
    />
  );
}
