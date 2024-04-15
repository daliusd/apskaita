import { Checkbox } from '@mantine/core';
import { notifications } from '@mantine/notifications';

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

    let response: Response;
    try {
      response = await fetch('/api/invoiceslocked/' + invoiceId, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ locked }),
      });
    } catch {}

    if (!response || !response.ok || !(await response.json()).success) {
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
