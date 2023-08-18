import { useEffect } from 'react';
import TextField from '@mui/material/TextField';
import { useRecoilState } from 'recoil';
import useSWR from 'swr';

import { cleanUpString } from '../../utils/textutils';
import {
  languageAfterChangeState,
  lockedState,
  issuerState,
  seriesNameState,
} from '../../src/atoms';

export default function IssuerInput() {
  const [issuer, setIssuer] = useRecoilState(issuerState);
  const [locked] = useRecoilState(lockedState);
  const [languageAfterChange] = useRecoilState(languageAfterChangeState);
  const [seriesName] = useRecoilState(seriesNameState);

  const { data: lastSellerData } = useSWR(
    languageAfterChange &&
      seriesName &&
      `/api/lastseller/${languageAfterChange}/${seriesName}`,
  );

  useEffect(() => {
    if (lastSellerData && lastSellerData.issuer) {
      setIssuer(lastSellerData.issuer);
    }
  }, [lastSellerData, setIssuer]);

  const disabled = locked || (languageAfterChange && !lastSellerData);

  return (
    <TextField
      variant="standard"
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
