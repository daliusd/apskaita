import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import useSWR from 'swr';

import { cleanUpString } from '../../utils/textutils';
import {
  languageAfterChangeState,
  lockedState,
  sellerState,
  seriesNameState,
} from '../../src/atoms';
import { Textarea } from '@mantine/core';

export default function SellerInput() {
  const [seller, setSeller] = useRecoilState(sellerState);
  const [locked] = useRecoilState(lockedState);
  const [languageAfterChange] = useRecoilState(languageAfterChangeState);
  const [seriesName] = useRecoilState(seriesNameState);

  const { data: lastSellerData } = useSWR(
    languageAfterChange &&
      seriesName &&
      `/api/lastseller/${languageAfterChange}/${seriesName}`,
  );
  useEffect(() => {
    if (lastSellerData && lastSellerData.seller) {
      setSeller(lastSellerData.seller);
    }
  }, [lastSellerData, setSeller]);

  const disabled = locked || (languageAfterChange && !lastSellerData);

  return (
    <Textarea
      label="Pardavėjas"
      aria-label={'Pardavėjas'}
      value={seller}
      onChange={(e) => {
        setSeller(cleanUpString(e.target.value));
      }}
      autosize
      minRows={4}
      disabled={disabled}
    />
  );
}
