import React, { useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import { useRecoilState } from 'recoil';
import useSWR from 'swr';

import { cleanUpString } from '../../utils/textutils';
import {
  languageAfterChangeState,
  lockedState,
  extraState,
} from '../../src/atoms';

export default function ExtraInput() {
  const [extra, setExtra] = useRecoilState(extraState);
  const [locked] = useRecoilState(lockedState);
  const [languageAfterChange] = useRecoilState(languageAfterChangeState);

  const languageSettingPlus = languageAfterChange === 'en' ? '_en' : '';

  const { data: extraData } = useSWR(
    languageAfterChange && `/api/settings/extra${languageSettingPlus}`,
  );
  useEffect(() => {
    if (extraData && extraData.value) {
      setExtra(extraData.value);
    }
  }, [extraData, setExtra]);

  const disabled = locked || (languageAfterChange && !extraData);

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
      rows={2}
      variant="outlined"
      disabled={disabled}
    />
  );
}
