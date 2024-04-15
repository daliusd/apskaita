import React from 'react';
import { useRecoilState } from 'recoil';
import { Checkbox } from '@mantine/core';
import { notifications } from '@mantine/notifications';

interface IProps {
  invoiceId?: string;
  paid: boolean;
  setPaid: (v: boolean) => void;
}

export default function InvoicePaidCheckbox({
  invoiceId,
  paid,
  setPaid,
}: IProps) {
  if (!invoiceId) return null;

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const paid = event.currentTarget.checked;

    let response: Response;
    try {
      response = await fetch('/api/invoicespaid/' + invoiceId, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paid }),
      });
    } catch {}

    if (!response || !response.ok || !(await response.json()).success) {
      notifications.show({
        message: 'Įvyko klaida keičiant apmokėjimo būseną.',
        color: 'red',
      });
      return;
    }

    setPaid(paid);
  };

  return (
    <Checkbox
      name="paid"
      checked={paid}
      onChange={handleChange}
      label="Apmokėta"
    />
  );
}
