import { useEffect } from 'react';
import TextField from '@mui/material/TextField';
import { useRecoilState } from 'recoil';
import useSWR from 'swr';

import { cleanUpString } from '../../utils/textutils';
import {
  languageAfterChangeState,
  lockedState,
  extraState,
  seriesNameState,
} from '../../src/atoms';

export default function ExtraInput() {
  const [extra, setExtra] = useRecoilState(extraState);
  const [locked] = useRecoilState(lockedState);
  const [languageAfterChange] = useRecoilState(languageAfterChangeState);
  const [seriesName] = useRecoilState(seriesNameState);

  const { data: lastSellerData } = useSWR(
    languageAfterChange &&
      seriesName &&
      `/api/lastseller/${languageAfterChange}/${seriesName}`,
  );
  useEffect(() => {
    if (lastSellerData && lastSellerData.extra) {
      setExtra(lastSellerData.extra);
    }
  }, [lastSellerData, setExtra]);

  const disabled = locked || (languageAfterChange && !lastSellerData);

  return (
    <TextField
      label="Papildoma informacija sąskaitoje faktūroje"
      inputProps={{ 'aria-label': 'Papildoma informacija' }}
      value={extra}
      onChange={(e) => {
        setExtra(cleanUpString(e.target.value));
      }}
      fullWidth
      multiline
      minRows={2}
      variant="outlined"
      disabled={disabled}
    />
  );
}
