import React from 'react';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';

interface IProps {
  language: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

export default function LanguageSelect({
  language,
  onChange,
  disabled,
}: IProps) {
  return (
    <FormControl fullWidth aria-label="Kalba">
      <InputLabel id="language-selector">Kalba</InputLabel>
      <Select
        labelId="language-selector"
        value={language}
        onChange={(e) => onChange(e.target.value as string)}
        disabled={disabled}
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
