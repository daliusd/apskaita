import React from 'react';
import { KeyboardDatePicker } from '@material-ui/pickers';

import { getDateString } from '../utils/date';

interface IProps {
  date: Date;
  onChange: (d: Date) => void;
  validInvoiceDate?: {
    success: boolean;
    minValidDate?: number;
    maxValidDate?: number;
  };
}

export default function InvoiceDateInput({
  date,
  onChange,
  validInvoiceDate,
}: IProps) {
  return (
    <KeyboardDatePicker
      label="Sąskaitos data"
      inputProps={{ 'aria-label': 'Sąskaitos data' }}
      value={date}
      onChange={onChange}
      format="yyyy-MM-dd"
      fullWidth
      invalidDateMessage={'Neteisingas datos formatas'}
      error={validInvoiceDate ? !validInvoiceDate.success : !date.getTime()}
      helperText={
        validInvoiceDate
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
          : ''
      }
    />
  );
}
