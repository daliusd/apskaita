import { useState } from 'react';
import { Combobox, Textarea, useCombobox } from '@mantine/core';
import useSWR from 'swr';
import { useDebounce } from 'react-use';

import { cleanUpString } from '../../utils/textutils';

interface IProps {
  buyer: string;
  onChange: (b: { buyer: string; email: string }) => void;
  disabled: boolean;
  rows?: number;
}

export default function BuyerInput({ buyer, onChange, disabled }: IProps) {
  const combobox = useCombobox();
  const [debouncedBuyer, setDebouncedBuyer] = useState('');
  useDebounce(() => setDebouncedBuyer(buyer), 500, [buyer]);
  const { data: dataBuyer } = useSWR(`/api/uniquebuyers/${debouncedBuyer}`);
  const buyerToEmail = {};
  dataBuyer?.buyers?.forEach((b) => {
    buyerToEmail[b.buyer] = b.email;
  });

  const options = (dataBuyer?.buyers?.map((b) => b.buyer) || []).map((item) => (
    <Combobox.Option value={item} key={item}>
      {item}
    </Combobox.Option>
  ));

  return (
    <Combobox
      onOptionSubmit={(value) => {
        const email = buyerToEmail[value] || '';
        onChange({ buyer: value, email });
        combobox.closeDropdown();
      }}
      store={combobox}
    >
      <Combobox.Target>
        <Textarea
          label="Pirkėjas"
          aria-label={'Pirkėjas'}
          disabled={disabled}
          value={buyer}
          autosize
          minRows={4}
          onChange={(event) => {
            const value = cleanUpString(event.currentTarget.value);
            const email = buyerToEmail[value] || '';
            onChange({ buyer: value, email });
            combobox.openDropdown();
            combobox.updateSelectedOptionIndex();
          }}
          onClick={() => combobox.openDropdown()}
          onFocus={() => combobox.openDropdown()}
          onBlur={() => combobox.closeDropdown()}
        />
      </Combobox.Target>

      {options.length > 0 && (
        <Combobox.Dropdown>
          <Combobox.Options>{options}</Combobox.Options>
        </Combobox.Dropdown>
      )}
    </Combobox>
  );
}
