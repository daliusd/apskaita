import React from 'react';
import { Checkbox } from '@mantine/core';
import { notifications } from '@mantine/notifications';

interface IProps {
  invoiceId?: string;
  sent: boolean;
  setSent: (v: boolean) => void;
}

export default function InvoiceSentCheckbox({
  invoiceId,
  sent,
  setSent,
}: IProps) {
  if (!invoiceId) return null;

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const sent = event.currentTarget.checked;

    let response: Response;
    try {
      response = await fetch('/api/invoicessent/' + invoiceId, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sent }),
      });
    } catch {}

    if (!response || !response.ok || !(await response.json()).success) {
      notifications.show({
        message: 'Įvyko klaida pažymint sąskaitą kaip išsiųstą/neišsiųstą.',
        color: 'red',
      });
      return;
    }

    setSent(sent);
  };

  return <Checkbox checked={sent} onChange={handleChange} label="Išsiųsta" />;
}
