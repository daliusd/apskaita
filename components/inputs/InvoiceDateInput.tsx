import React from 'react';
import { DatePicker } from '@mui/x-date-pickers';

import { getDateString } from '../../utils/date';
import TextField from '@mui/material/TextField';

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
      componentsProps={{
        textField: {
          fullWidth: true,
          inputProps: {
            'aria-label': 'Sąskaitos data',
          },
          variant: 'standard',
          error: validInvoiceDate ? !validInvoiceDate.success : !date.getTime(),
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
            : !date.getTime()
            ? 'Data yra būtina'
            : '',
        },
      }}
      disabled={disabled}
    />
  );
}
