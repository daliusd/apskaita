import { useState } from 'react';
import { Autocomplete } from '@mantine/core';
import useSWR from 'swr';
import { useDebounce } from 'react-use';

import { cleanUpString } from '../../utils/textutils';

interface IProps {
  buyer: string;
  onChange: (b: { buyer: string; email: string }) => void;
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
  const buyerToEmail = {};
  dataBuyer?.buyers?.forEach((b) => {
    buyerToEmail[b.buyer] = b.email;
  });

  return (
    <Autocomplete
      data={dataBuyer?.buyers?.map((b) => b.buyer.split('\n', 1)[0]) || []}
      value={buyer}
      disabled={disabled}
      onChange={(newValue) => {
        const value = cleanUpString(newValue);
        const email = buyerToEmail[value] || '';
        onChange({ buyer: value, email });
      }}
      label="Pirkėjas"
      aria-label={'Pirkėjas'}
    />
  );
}
