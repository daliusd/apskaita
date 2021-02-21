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
  disabled: boolean;
}

export default function InvoiceDateInput({
  date,
  onChange,
  validInvoiceDate,
  disabled,
}: IProps) {
  return (
    <KeyboardDatePicker
      label="Sąskaitos data"
      autoOk={true}
      inputProps={{ 'aria-label': 'Sąskaitos data' }}
      value={date}
      onChange={onChange}
      format="yyyy-MM-dd"
      fullWidth
      invalidDateMessage={'Neteisingas datos formatas'}
      error={validInvoiceDate ? !validInvoiceDate.success : !date.getTime()}
      disabled={disabled}
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
      okLabel="Gerai"
      cancelLabel="Nutraukti"
    />
  );
}
