import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import useSWR from 'swr';
import { useDebounce } from 'react-recipes';

import { cleanUpString } from '../../utils/textutils';

interface IProps {
  seriesName: string;
  invoiceType: string;
  onChange: (value: string) => void;
  disabled: boolean;
  valid?: boolean;
}

function cleanSerialNumber(str: string) {
  return str.replace(/[^0-9a-z]/gi, '');
}

export default function SeriesNameInput({
  seriesName,
  invoiceType,
  onChange,
  disabled,
  valid,
}: IProps) {
  const debouncedSeriesName = useDebounce(seriesName, 500);

  const { data: seriesNamesData } = useSWR(
    `/api/uniqueseriesnames/${debouncedSeriesName}` +
      (invoiceType !== 'all' ? `?invoiceType=${invoiceType}` : ''),
  );

  const options = seriesNamesData ? seriesNamesData.seriesNames : [];

  return (
    <Autocomplete
      options={options}
      fullWidth
      value={seriesName}
      inputValue={seriesName}
      onInputChange={(_e, newValue) => {
        const value = cleanSerialNumber(cleanUpString(newValue));
        onChange(value);
      }}
      freeSolo
      renderInput={(params) => (
        <TextField
          variant="standard"
          {...params}
          label="Serijos pavadinimas"
          inputProps={{
            'aria-label': 'Serijos pavadinimas',
            ...params.inputProps,
          }}
          error={valid === false}
          helperText={
            valid === false
              ? seriesName.length === 0
                ? 'Įveskite serijos pavadinimą'
                : 'Serijos pavadinimas naudojamas kito tipo sąskaitoms faktūroms'
              : ''
          }
        />
      )}
      disabled={disabled}
    />
  );
}
