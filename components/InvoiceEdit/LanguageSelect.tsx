import React from 'react';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { useRecoilState } from 'recoil';

import {
  languageState,
  languageAfterChangeState,
  lockedState,
} from '../../src/atoms';

export default function LanguageSelect() {
  const [language, setLanguage] = useRecoilState(languageState);
  const [, setLanguageAfterChange] = useRecoilState(languageAfterChangeState);
  const [locked] = useRecoilState(lockedState);

  return (
    <FormControl fullWidth aria-label="Kalba">
      <InputLabel id="language-selector">Kalba</InputLabel>
      <Select
        labelId="language-selector"
        value={language}
        onChange={(e) => {
          setLanguage(e.target.value as string);
          setLanguageAfterChange(e.target.value as string);
        }}
        disabled={locked}
      >
        <MenuItem value="lt" aria-label="lt">
          Lietuvių
        </MenuItem>
        <MenuItem value="en" aria-label="en">
          Anglų
        </MenuItem>
      </Select>
    </FormControl>
  );
}
