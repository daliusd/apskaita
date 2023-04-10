import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormControlLabel from '@mui/material/FormControlLabel';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';

type IInvoiceType = 'standard' | 'proforma' | 'credit';

interface IProps {
  invoiceType: IInvoiceType;
  onChange: (value: IInvoiceType) => void;
  disabled: boolean;
}

export default function InvoiceTypeSelector({
  invoiceType,
  onChange,
  disabled,
}: IProps) {
  return (
    <FormControl component="fieldset">
      <FormLabel component="legend">Sąskaitos faktūros tipas</FormLabel>
      <RadioGroup
        aria-label="Sąskaitos faktūros tipas"
        name="invoiceType"
        value={invoiceType}
        onChange={(e) => onChange(e.target.value as IInvoiceType)}
        row
      >
        <FormControlLabel
          value="standard"
          control={<Radio />}
          label="Standartinė"
          disabled={disabled}
        />
        <FormControlLabel
          value="proforma"
          control={<Radio />}
          label="Išankstinė"
          disabled={disabled}
        />
        <FormControlLabel
          value="credit"
          control={<Radio />}
          label="Kreditinė"
          disabled={disabled}
        />
      </RadioGroup>
    </FormControl>
  );
}
