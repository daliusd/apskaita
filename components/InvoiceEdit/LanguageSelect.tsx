import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
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
    <FormControl variant="standard" fullWidth aria-label="Kalba">
      <InputLabel id="language-selector">Kalba</InputLabel>
      <Select
        variant="standard"
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
