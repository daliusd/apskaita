import { Checkbox } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { putInvoiceslocked } from '../api/putInvoiceslocked';

interface IProps {
  invoiceId?: string;
  locked: boolean;
  setLocked: (v: boolean) => void;
}

export default function InvoiceLockedCheckbox({
  invoiceId,
  locked,
  setLocked,
}: IProps) {
  if (!invoiceId) return null;

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const locked = event.currentTarget.checked;

    if (!(await putInvoiceslocked(invoiceId, locked))) {
      notifications.show({
        message: 'Įvyko klaida užrakinant/atrakinant sąskaitą.',
        color: 'red',
      });
      return;
    }

    setLocked(locked);
  };

  return (
    <Checkbox
      name="locked"
      checked={locked}
      onChange={handleChange}
      label="Užrakinta"
    />
  );
}
