import React, { useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import { useRecoilState } from 'recoil';
import useSWR from 'swr';

import { cleanUpString } from '../../utils/textutils';
import {
  languageAfterChangeState,
  lockedState,
  issuerState,
} from '../../src/atoms';

export default function IssuerInput() {
  const [issuer, setIssuer] = useRecoilState(issuerState);
  const [locked] = useRecoilState(lockedState);
  const [languageAfterChange] = useRecoilState(languageAfterChangeState);

  const languageSettingPlus = languageAfterChange === 'en' ? '_en' : '';

  const { data: issuerData } = useSWR(
    languageAfterChange && `/api/settings/issuer${languageSettingPlus}`,
  );
  useEffect(() => {
    if (issuerData && issuerData.value) {
      setIssuer(issuerData.value);
    }
  }, [issuerData, setIssuer]);

  const disabled = locked || (languageAfterChange && !issuerData);

  return (
    <TextField
      label="Sąskaitą faktūrą išrašė"
      inputProps={{ 'aria-label': 'SF išrašė' }}
      value={issuer}
      disabled={disabled}
      onChange={(e) => {
        setIssuer(cleanUpString(e.target.value));
      }}
      fullWidth
    />
  );
}
