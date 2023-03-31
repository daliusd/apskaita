import { DatePicker } from '@mui/x-date-pickers';

import { getDateString } from '../../utils/date';

interface IProps {
  date: Date;
  onChange: (d: Date) => void;
  validInvoiceDate?: {
    success: boolean;
    minValidDate?: number;
    maxValidDate?: number;
  };
  disabled: boolean;
}

export default function InvoiceDateInput({
  date,
  onChange,
  validInvoiceDate,
  disabled,
}: IProps) {
  return (
    <DatePicker
      label="Sąskaitos data"
      value={date}
      onChange={onChange}
      format="yyyy-MM-dd"
      slotProps={{
        textField: {
          fullWidth: true,
          inputProps: {
            'aria-label': 'Sąskaitos data',
          },
          variant: 'standard',
          error: validInvoiceDate
            ? !validInvoiceDate.success
            : !date || !date.getTime(),
          helperText: validInvoiceDate
            ? validInvoiceDate.minValidDate
              ? `Data turi būti ${getDateString(
                  validInvoiceDate.minValidDate,
                )} arba vėlesnė`
              : validInvoiceDate.maxValidDate
              ? `Data turi būti ${getDateString(
                  validInvoiceDate.maxValidDate,
                )} arba ankstesnė`
              : ''
            : !date || !date.getTime()
            ? 'Data yra būtina'
            : '',
        },
      }}
      disabled={disabled}
    />
  );
}
