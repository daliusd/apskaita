import { useState } from 'react';
import { Autocomplete } from '@mantine/core';
import useSWR from 'swr';
import { useDebounce } from 'react-use';

import { cleanUpString } from '../../utils/textutils';

interface IProps {
  buyer: string;
  onChange: (b: string) => void;
  disabled: boolean;
  rows?: number;
}

export default function BuyerFirstLineInput({
  buyer,
  onChange,
  disabled,
}: IProps) {
  const [debouncedBuyer, setDebouncedBuyer] = useState('');
  useDebounce(() => setDebouncedBuyer(buyer), 500, [buyer]);
  const { data: dataBuyer } = useSWR(`/api/uniquebuyers/${debouncedBuyer}`);

  return (
    <Autocomplete
      data={dataBuyer?.buyers?.map((b) => b.buyer) || []}
      value={buyer}
      disabled={disabled}
      onChange={(newValue) => {
        const value = cleanUpString(newValue?.split('\n', 1)[0]);
        onChange(value);
      }}
      label="Pirkėjas"
      aria-label={'Pirkėjas'}
    />
  );
}
