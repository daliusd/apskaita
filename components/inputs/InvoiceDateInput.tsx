import { DateInput } from '@mantine/dates';

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
    <DateInput
      label="Sąskaitos data"
      aria-label="Sąskaitos data"
      value={date}
      onChange={onChange}
      valueFormat="YYYY-MM-DD"
      disabled={disabled}
      error={
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
          : !date || !date.getTime()
            ? 'Data yra būtina'
            : ''
      }
    />
  );
}
