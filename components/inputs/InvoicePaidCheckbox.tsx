import React from 'react';
import { useRecoilState } from 'recoil';
import { Checkbox } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { putInvoicepaid } from '../api/putInvoicepaid';

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

    if (!(await putInvoicepaid(invoiceId, paid))) {
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
