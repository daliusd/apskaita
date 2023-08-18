import { useEffect } from 'react';
import TextField from '@mui/material/TextField';
import { useRecoilState } from 'recoil';
import useSWR from 'swr';

import { cleanUpString } from '../../utils/textutils';
import {
  languageAfterChangeState,
  lockedState,
  sellerState,
  seriesNameState,
} from '../../src/atoms';

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
    <TextField
      label="Pardavėjas"
      inputProps={{ 'aria-label': 'Pardavėjas' }}
      value={seller}
      onChange={(e) => {
        setSeller(cleanUpString(e.target.value));
      }}
      fullWidth
      multiline
      minRows={4}
      variant="outlined"
      disabled={disabled}
    />
  );
}
