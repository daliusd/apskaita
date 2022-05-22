import React, { useEffect } from 'react';
import TextField from '@mui/material/TextField';
import { useRecoilState } from 'recoil';
import useSWR from 'swr';

import { cleanUpString } from '../../utils/textutils';
import {
  languageAfterChangeState,
  lockedState,
  sellerState,
} from '../../src/atoms';

export default function SellerInput() {
  const [seller, setSeller] = useRecoilState(sellerState);
  const [locked] = useRecoilState(lockedState);
  const [languageAfterChange] = useRecoilState(languageAfterChangeState);

  const languageSettingPlus = languageAfterChange === 'en' ? '_en' : '';

  const { data: sellerData } = useSWR(
    languageAfterChange && `/api/settings/seller${languageSettingPlus}`,
  );
  useEffect(() => {
    if (sellerData && sellerData.value) {
      setSeller(sellerData.value);
    }
  }, [sellerData, setSeller]);

  const disabled = locked || (languageAfterChange && !sellerData);

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
